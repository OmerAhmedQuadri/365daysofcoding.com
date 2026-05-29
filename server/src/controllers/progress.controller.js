import prisma from '../lib/prisma.js';

async function computeTopicProgress(userId, topicId) {
  const labs = await prisma.lab.findMany({
    where: { topic_id: topicId },
    select: { id: true },
  });

  const total_labs = labs.length;
  if (total_labs === 0) return { total_labs: 0, passed_labs: 0, is_complete: false };

  const passed_labs = await prisma.labSubmission.count({
    where: {
      user_id: userId,
      lab_id: { in: labs.map(l => l.id) },
      status: 'passed',
    },
  });

  return { total_labs, passed_labs, is_complete: passed_labs === total_labs };
}

export async function getTopicProgress(req, res, next) {
  try {
    const progress = await computeTopicProgress(req.user.id, req.params.topicId);
    res.json({ data: progress });
  } catch (err) {
    next(err);
  }
}

export async function getCourseProgress(req, res, next) {
  try {
    const topics = await prisma.topic.findMany({
      where: { course_id: req.params.courseId },
      orderBy: { order_index: 'asc' },
      select: { id: true, title: true, order_index: true },
    });

    const data = await Promise.all(
      topics.map(async t => ({
        ...t,
        ...(await computeTopicProgress(req.user.id, t.id)),
      })),
    );

    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function getStudentOverview(req, res, next) {
  try {
    const total_passed = await prisma.labSubmission.count({
      where: { user_id: req.user.id, status: 'passed' },
    });

    res.json({ data: { total_passed } });
  } catch (err) {
    next(err);
  }
}
