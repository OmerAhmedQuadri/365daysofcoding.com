import prisma from '../lib/prisma.js';

export async function getMyBootcamp(req, res, next) {
  try {
    const membership = await prisma.bootcampMember.findFirst({
      where: { user_id: req.user.id },
      include: {
        bootcamp: {
          include: {
            bootcamp_labs: {
              include: {
                lab: {
                  select: {
                    id: true,
                    title: true,
                    order_index: true,
                    lab_format: true,
                    lab_type: true,
                    topic_id: true,
                    topic: { select: { course_id: true } },
                  },
                },
              },
              orderBy: { assigned_at: 'asc' },
            },
          },
        },
      },
    });

    if (!membership) {
      return res.status(404).json({ error: 'You are not a member of any bootcamp' });
    }

    res.json({ data: membership.bootcamp });
  } catch (err) {
    next(err);
  }
}

export async function getLeaderboard(req, res, next) {
  try {
    const { id: bootcamp_id } = req.params;

    // Only members (or admins) can view the leaderboard
    if (req.user.role !== 'admin') {
      const membership = await prisma.bootcampMember.findUnique({
        where: { bootcamp_id_user_id: { bootcamp_id, user_id: req.user.id } },
      });
      if (!membership) {
        return res.status(403).json({ error: 'Not a member of this bootcamp' });
      }
    }

    const [members, bootcampLabs] = await Promise.all([
      prisma.bootcampMember.findMany({
        where: { bootcamp_id, member_role: 'student' },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
      prisma.bootcampLab.findMany({
        where: { bootcamp_id },
        select: { lab_id: true },
      }),
    ]);

    const labIds = bootcampLabs.map(bl => bl.lab_id);

    const entries = await Promise.all(
      members.map(async (m) => {
        const labs_passed = await prisma.labSubmission.count({
          where: { user_id: m.user_id, lab_id: { in: labIds }, status: 'passed' },
        });
        return { user: m.user, labs_passed };
      }),
    );

    entries.sort((a, b) => b.labs_passed - a.labs_passed);

    res.json({ data: entries });
  } catch (err) {
    next(err);
  }
}

export async function getStudentProgress(req, res, next) {
  try {
    const { id: bootcamp_id } = req.params;

    const [members, bootcampLabs] = await Promise.all([
      prisma.bootcampMember.findMany({
        where: { bootcamp_id, member_role: 'student' },
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { joined_at: 'asc' },
      }),
      prisma.bootcampLab.findMany({
        where: { bootcamp_id },
        include: {
          lab: {
            select: {
              id: true,
              title: true,
              order_index: true,
              topic_id: true,
              topic: { select: { id: true, title: true } },
            },
          },
        },
        orderBy: [
          { lab: { topic: { order_index: 'asc' } } },
          { lab: { order_index: 'asc' } },
        ],
      }),
    ]);

    const labIds = bootcampLabs.map(bl => bl.lab_id);
    const userIds = members.map(m => m.user_id);

    const submissions = await prisma.labSubmission.findMany({
      where: { user_id: { in: userIds }, lab_id: { in: labIds } },
      select: { user_id: true, lab_id: true, status: true, tests_passed: true, tests_total: true },
    });

    // Build lookup: userId → labId → submission
    const subMap = {};
    for (const s of submissions) {
      (subMap[s.user_id] ??= {})[s.lab_id] = s;
    }

    const data = members.map((m) => ({
      user: m.user,
      progress: bootcampLabs.map((bl) => {
        const sub = subMap[m.user_id]?.[bl.lab_id];
        return {
          lab_id: bl.lab_id,
          lab_title: bl.lab.title,
          topic_id: bl.lab.topic_id,
          topic_title: bl.lab.topic.title,
          status: sub?.status ?? null,
          tests_passed: sub?.tests_passed ?? 0,
          tests_total: sub?.tests_total ?? 0,
        };
      }),
    }));

    res.json({ data });
  } catch (err) {
    next(err);
  }
}
