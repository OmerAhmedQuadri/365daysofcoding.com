import prisma from '../lib/prisma.js';

export async function getById(req, res, next) {
  try {
    const lab = await prisma.lab.findUnique({
      where: { id: req.params.id },
      include: {
        test_cases: {
          orderBy: { order_index: 'asc' },
        },
      },
    });

    if (!lab) return res.status(404).json({ error: 'Lab not found' });

    if (lab.order_index > 1) {
      const prevLab = await prisma.lab.findFirst({
        where: { topic_id: lab.topic_id, order_index: lab.order_index - 1 },
        select: { id: true },
      });

      if (prevLab) {
        const prevSubmission = await prisma.labSubmission.findUnique({
          where: { user_id_lab_id: { user_id: req.user.id, lab_id: prevLab.id } },
        });

        if (!prevSubmission || prevSubmission.status !== 'passed') {
          return res.status(403).json({ error: 'Complete the previous lab first', topic_id: lab.topic_id });
        }
      }
    }

    const { solution_code: _omitted, ...labData } = lab;

    res.json({ data: labData });
  } catch (err) {
    next(err);
  }
}
