import prisma from '../lib/prisma.js';

export async function getByLab(labId) {
  return prisma.testCase.findMany({
    where: { lab_id: labId },
    orderBy: { order_index: 'asc' },
  });
}
