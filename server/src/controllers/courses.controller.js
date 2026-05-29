import prisma from '../lib/prisma.js';

export async function getAll(_req, res, next) {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { order_index: 'asc' },
      include: {
        _count: { select: { topics: true } },
      },
    });

    res.json({
      data: courses.map(c => ({
        id: c.id,
        title: c.title,
        description: c.description,
        order_index: c.order_index,
        created_at: c.created_at,
        topic_count: c._count.topics,
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: req.params.id },
      include: {
        topics: {
          orderBy: { order_index: 'asc' },
          include: {
            _count: { select: { labs: true } },
          },
        },
      },
    });

    if (!course) return res.status(404).json({ error: 'Course not found' });

    res.json({
      data: {
        id: course.id,
        title: course.title,
        description: course.description,
        order_index: course.order_index,
        created_at: course.created_at,
        topics: course.topics.map(t => ({
          id: t.id,
          title: t.title,
          description: t.description,
          order_index: t.order_index,
          lab_count: t._count.labs,
        })),
      },
    });
  } catch (err) {
    next(err);
  }
}
