import prisma from '../lib/prisma.js';
import { isDemoUser } from '../lib/demo.js';

export async function upsert(req, res, next) {
  try {
    const { lab_id, code, status, tests_passed, tests_total } = req.body;

    if (!lab_id || code === undefined || !status || tests_passed === undefined || tests_total === undefined) {
      return res.status(400).json({ error: 'lab_id, code, status, tests_passed, and tests_total are required' });
    }

    // The demo account is shared by every visitor, so its code is never stored.
    // Otherwise one visitor could leave code in the editor for the next one to run.
    const savedCode = isDemoUser(req.user) ? '' : code;

    const submission = await prisma.labSubmission.upsert({
      where: { user_id_lab_id: { user_id: req.user.id, lab_id } },
      update: { code: savedCode, status, tests_passed, tests_total },
      create: { user_id: req.user.id, lab_id, code: savedCode, status, tests_passed, tests_total },
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

    // null code makes the lab page show starter code (also hides code saved before this rule)
    const data = submission && isDemoUser(req.user) ? { ...submission, code: null } : submission;

    res.json({ data: data ?? null });
  } catch (err) {
    next(err);
  }
}
