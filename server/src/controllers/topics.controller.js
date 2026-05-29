import prisma from '../lib/prisma.js';

export async function getById(req, res, next) {
  try {
    const topic = await prisma.topic.findUnique({
      where: { id: req.params.id },
      include: {
        labs: {
          orderBy: { order_index: 'asc' },
          select: {
            id: true,
            title: true,
            lab_type: true,
            lab_format: true,
            order_index: true,
          },
        },
      },
    });

    if (!topic) return res.status(404).json({ error: 'Topic not found' });

    const completion = await getCompletion(req.user.id, req.params.id);

    res.json({ data: { ...topic, completion } });
  } catch (err) {
    next(err);
  }
}

export async function getCompletion(userId, topicId) {
  const labs = await prisma.lab.findMany({
    where: { topic_id: topicId },
    select: { id: true },
  });

  if (labs.length === 0) return { completed: false, total: 0, passed: 0 };

  const passed = await prisma.labSubmission.count({
    where: {
      user_id: userId,
      lab_id: { in: labs.map(l => l.id) },
      status: 'passed',
    },
  });

  return { completed: passed === labs.length, total: labs.length, passed };
}
