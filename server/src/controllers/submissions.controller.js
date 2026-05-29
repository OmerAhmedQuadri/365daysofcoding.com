import prisma from '../lib/prisma.js';

export async function upsert(req, res, next) {
  try {
    const { lab_id, code, status, tests_passed, tests_total } = req.body;

    if (!lab_id || code === undefined || !status || tests_passed === undefined || tests_total === undefined) {
      return res.status(400).json({ error: 'lab_id, code, status, tests_passed, and tests_total are required' });
    }

    const submission = await prisma.labSubmission.upsert({
      where: { user_id_lab_id: { user_id: req.user.id, lab_id } },
      update: { code, status, tests_passed, tests_total },
      create: { user_id: req.user.id, lab_id, code, status, tests_passed, tests_total },
    });

    res.json({ data: submission });
  } catch (err) {
    next(err);
  }
}

export async function getByLab(req, res, next) {
  try {
    const submission = await prisma.labSubmission.findUnique({
      where: { user_id_lab_id: { user_id: req.user.id, lab_id: req.params.labId } },
    });

    res.json({ data: submission ?? null });
  } catch (err) {
    next(err);
  }
}
