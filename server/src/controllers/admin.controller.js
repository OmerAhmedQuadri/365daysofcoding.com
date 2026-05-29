import bcrypt from 'bcrypt';
import prisma from '../lib/prisma.js';

export async function createBootcamp(req, res, next) {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(400).json({ error: 'name and description are required' });
    }
    const bootcamp = await prisma.bootcamp.create({
      data: { name, description, created_by: req.user.id },
    });
    res.status(201).json({ data: bootcamp });
  } catch (err) {
    next(err);
  }
}

async function createUser(role, req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are required' });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already in use' });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password_hash, role },
      select: { id: true, name: true, email: true, role: true, created_at: true },
    });
    res.status(201).json({ data: user });
  } catch (err) {
    next(err);
  }
}

export function createInstructor(req, res, next) {
  return createUser('instructor', req, res, next);
}

export function createAdmin(req, res, next) {
  return createUser('admin', req, res, next);
}

export async function addBootcampMember(req, res, next) {
  try {
    const bootcamp_id = req.params.id;
    const { email, member_role } = req.body;
    if (!email || !member_role) {
      return res.status(400).json({ error: 'email and member_role are required' });
    }
    if (!['instructor', 'student'].includes(member_role)) {
      return res.status(400).json({ error: 'member_role must be instructor or student' });
    }
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!user) {
      return res.status(404).json({ error: 'No user found with that email' });
    }
    const existing = await prisma.bootcampMember.findUnique({
      where: { bootcamp_id_user_id: { bootcamp_id, user_id: user.id } },
    });
    if (existing) {
      return res.status(400).json({ error: 'User is already a member of this bootcamp' });
    }
    const member = await prisma.bootcampMember.create({
      data: { bootcamp_id, user_id: user.id, member_role },
    });
    res.status(201).json({ data: { ...member, user } });
  } catch (err) {
    next(err);
  }
}

export async function removeBootcampMember(req, res, next) {
  try {
    const { id: bootcamp_id, userId: user_id } = req.params;
    const member = await prisma.bootcampMember.findUnique({
      where: { bootcamp_id_user_id: { bootcamp_id, user_id } },
    });
    if (!member) {
      return res.status(404).json({ error: 'Member not found in this bootcamp' });
    }
    await prisma.bootcampMember.delete({
      where: { bootcamp_id_user_id: { bootcamp_id, user_id } },
    });
    res.json({ message: 'Member removed' });
  } catch (err) {
    next(err);
  }
}

export async function assignLabToBootcamp(req, res, next) {
  try {
    const bootcamp_id = req.params.id;
    const { lab_id } = req.body;
    if (!lab_id) {
      return res.status(400).json({ error: 'lab_id is required' });
    }
    try {
      const assignment = await prisma.bootcampLab.create({
        data: { bootcamp_id, lab_id, assigned_by: req.user.id },
      });
      res.status(201).json({ data: assignment });
    } catch (err) {
      if (err.code === 'P2002') {
        return res.status(400).json({ error: 'Lab already assigned to this bootcamp' });
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
}

export async function listBootcamps(req, res, next) {
  try {
    const bootcamps = await prisma.bootcamp.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        _count: { select: { members: true } },
      },
    });
    const data = bootcamps.map(({ _count, ...b }) => ({
      ...b,
      member_count: _count.members,
    }));
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function getStats(req, res, next) {
  try {
    const [courses, labs, students, bootcamps] = await Promise.all([
      prisma.course.count(),
      prisma.lab.count(),
      prisma.user.count({ where: { role: 'student' } }),
      prisma.bootcamp.count(),
    ]);
    res.json({ data: { courses, labs, students, bootcamps } });
  } catch (err) {
    next(err);
  }
}

export async function getLabAdmin(req, res, next) {
  try {
    const lab = await prisma.lab.findUnique({
      where: { id: req.params.id },
      include: { test_cases: { orderBy: { order_index: 'asc' } } },
    });
    if (!lab) return res.status(404).json({ error: 'Lab not found' });
    res.json({ data: lab });
  } catch (err) {
    next(err);
  }
}

export async function listInstructors(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'instructor' },
      select: { id: true, name: true, email: true, created_at: true },
      orderBy: { created_at: 'desc' },
    });
    res.json({ data: users });
  } catch (err) {
    next(err);
  }
}

export async function listAdmins(req, res, next) {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'admin' },
      select: { id: true, name: true, email: true, created_at: true },
      orderBy: { created_at: 'desc' },
    });
    res.json({ data: users });
  } catch (err) {
    next(err);
  }
}

export async function removeBootcampLab(req, res, next) {
  try {
    const { id: bootcamp_id, labId: lab_id } = req.params;
    await prisma.bootcampLab.delete({
      where: { bootcamp_id_lab_id: { bootcamp_id, lab_id } },
    });
    res.json({ message: 'Lab removed from bootcamp' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Lab not assigned to this bootcamp' });
    }
    next(err);
  }
}

export async function createCourse(req, res, next) {
  try {
    const { title, description, order_index } = req.body;
    if (!title) return res.status(400).json({ error: 'title is required' });
    const course = await prisma.course.create({
      data: { title, description: description ?? '', order_index: order_index ?? 0 },
    });
    res.status(201).json({ data: course });
  } catch (err) {
    next(err);
  }
}

export async function updateCourse(req, res, next) {
  try {
    const { title, description, order_index } = req.body;
    const course = await prisma.course.update({
      where: { id: req.params.id },
      data: { title, description, order_index },
    });
    res.json({ data: course });
  } catch (err) {
    next(err);
  }
}

export async function deleteCourse(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.$transaction(async (tx) => {
      const topics = await tx.topic.findMany({ where: { course_id: id }, select: { id: true } });
      const topicIds = topics.map(t => t.id);
      if (topicIds.length > 0) {
        const labs = await tx.lab.findMany({ where: { topic_id: { in: topicIds } }, select: { id: true } });
        const labIds = labs.map(l => l.id);
        if (labIds.length > 0) {
          await tx.testCase.deleteMany({ where: { lab_id: { in: labIds } } });
          await tx.bootcampLab.deleteMany({ where: { lab_id: { in: labIds } } });
          await tx.labSubmission.deleteMany({ where: { lab_id: { in: labIds } } });
          await tx.lab.deleteMany({ where: { topic_id: { in: topicIds } } });
        }
        await tx.topic.deleteMany({ where: { course_id: id } });
      }
      await tx.course.delete({ where: { id } });
    });
    res.json({ message: 'Course deleted' });
  } catch (err) {
    next(err);
  }
}

export async function createTopic(req, res, next) {
  try {
    const { course_id, title, description, order_index } = req.body;
    if (!course_id || !title) return res.status(400).json({ error: 'course_id and title are required' });
    const topic = await prisma.topic.create({
      data: { course_id, title, description: description ?? '', order_index: order_index ?? 0 },
    });
    res.status(201).json({ data: topic });
  } catch (err) {
    next(err);
  }
}

export async function updateTopic(req, res, next) {
  try {
    const { title, description, order_index } = req.body;
    const topic = await prisma.topic.update({
      where: { id: req.params.id },
      data: { title, description, order_index },
    });
    res.json({ data: topic });
  } catch (err) {
    next(err);
  }
}

export async function deleteTopic(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.$transaction(async (tx) => {
      const labs = await tx.lab.findMany({ where: { topic_id: id }, select: { id: true } });
      const labIds = labs.map(l => l.id);
      if (labIds.length > 0) {
        await tx.testCase.deleteMany({ where: { lab_id: { in: labIds } } });
        await tx.bootcampLab.deleteMany({ where: { lab_id: { in: labIds } } });
        await tx.labSubmission.deleteMany({ where: { lab_id: { in: labIds } } });
        await tx.lab.deleteMany({ where: { topic_id: id } });
      }
      await tx.topic.delete({ where: { id } });
    });
    res.json({ message: 'Topic deleted' });
  } catch (err) {
    next(err);
  }
}

export async function createLab(req, res, next) {
  try {
    const { topic_id, title, concept_md, starter_code, solution_code, lab_type, lab_format, order_index } = req.body;
    if (!topic_id || !title) return res.status(400).json({ error: 'topic_id and title are required' });
    const lab = await prisma.lab.create({
      data: {
        topic_id,
        title,
        concept_md: concept_md ?? '',
        starter_code: starter_code ?? '',
        solution_code: solution_code ?? '',
        lab_type: lab_type ?? 'javascript',
        lab_format: lab_format ?? 'problem_solving',
        order_index: order_index ?? 0,
      },
    });
    res.status(201).json({ data: lab });
  } catch (err) {
    next(err);
  }
}

export async function updateLab(req, res, next) {
  try {
    const { title, concept_md, starter_code, solution_code, lab_type, lab_format, order_index } = req.body;
    const lab = await prisma.lab.update({
      where: { id: req.params.id },
      data: { title, concept_md, starter_code, solution_code, lab_type, lab_format, order_index },
    });
    res.json({ data: lab });
  } catch (err) {
    next(err);
  }
}

export async function deleteLab(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.$transaction(async (tx) => {
      await tx.testCase.deleteMany({ where: { lab_id: id } });
      await tx.bootcampLab.deleteMany({ where: { lab_id: id } });
      await tx.labSubmission.deleteMany({ where: { lab_id: id } });
      await tx.lab.delete({ where: { id } });
    });
    res.json({ message: 'Lab deleted' });
  } catch (err) {
    next(err);
  }
}

export async function createTestCase(req, res, next) {
  try {
    const { lab_id, description, test_code, order_index } = req.body;
    if (!lab_id || !description || !test_code) {
      return res.status(400).json({ error: 'lab_id, description and test_code are required' });
    }
    const testCase = await prisma.testCase.create({
      data: { lab_id, description, test_code, order_index: order_index ?? 0 },
    });
    res.status(201).json({ data: testCase });
  } catch (err) {
    next(err);
  }
}

export async function updateTestCase(req, res, next) {
  try {
    const { description, test_code, order_index } = req.body;
    const testCase = await prisma.testCase.update({
      where: { id: req.params.id },
      data: { description, test_code, order_index },
    });
    res.json({ data: testCase });
  } catch (err) {
    next(err);
  }
}

export async function deleteTestCase(req, res, next) {
  try {
    await prisma.testCase.delete({ where: { id: req.params.id } });
    res.json({ message: 'Test case deleted' });
  } catch (err) {
    next(err);
  }
}

export async function getBootcamp(req, res, next) {
  try {
    const bootcamp = await prisma.bootcamp.findUnique({
      where: { id: req.params.id },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } },
          },
          orderBy: { joined_at: 'asc' },
        },
        bootcamp_labs: {
          include: {
            lab: {
              select: { id: true, title: true, order_index: true, lab_format: true, lab_type: true, topic_id: true },
            },
          },
          orderBy: { assigned_at: 'asc' },
        },
      },
    });
    if (!bootcamp) {
      return res.status(404).json({ error: 'Bootcamp not found' });
    }
    res.json({ data: bootcamp });
  } catch (err) {
    next(err);
  }
}
