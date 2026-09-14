import { request, authHeaders } from './request.js';

async function req(method, path, body) {
  const opts = {
    method,
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    fallbackError: 'Request failed',
  };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const json = await request(`/api/admin${path}`, opts);
  return json.data ?? json;
}

export const getAdminStats      = ()              => req('GET',    '/stats');
export const listInstructors    = ()              => req('GET',    '/instructors');
export const listAdmins         = ()              => req('GET',    '/admins');
export const createInstructor   = (data)          => req('POST',   '/instructors',                  data);
export const createAdmin        = (data)          => req('POST',   '/admins',                       data);

export const listBootcamps      = ()              => req('GET',    '/bootcamps');
export const getBootcampDetail  = (id)            => req('GET',    `/bootcamps/${id}`);
export const createBootcamp     = (data)          => req('POST',   '/bootcamps',                    data);
export const addBootcampMember  = (id, data)      => req('POST',   `/bootcamps/${id}/members`,      data);
export const removeBootcampMember = (id, userId)  => req('DELETE', `/bootcamps/${id}/members/${userId}`);
export const assignLabToBootcamp  = (id, data)    => req('POST',   `/bootcamps/${id}/labs`,         data);
export const removeBootcampLab    = (id, labId)   => req('DELETE', `/bootcamps/${id}/labs/${labId}`);

export const getLabAdmin      = (id)       => req('GET',    `/labs/${id}`);

export const createCourse     = (data)     => req('POST',   '/courses',           data);
export const updateCourse     = (id, data) => req('PUT',    `/courses/${id}`,     data);
export const deleteCourse     = (id)       => req('DELETE', `/courses/${id}`);

export const createTopic      = (data)     => req('POST',   '/topics',            data);
export const updateTopic      = (id, data) => req('PUT',    `/topics/${id}`,      data);
export const deleteTopic      = (id)       => req('DELETE', `/topics/${id}`);

export const createLab        = (data)     => req('POST',   '/labs',              data);
export const updateLab        = (id, data) => req('PUT',    `/labs/${id}`,        data);
export const deleteLab        = (id)       => req('DELETE', `/labs/${id}`);

export const createTestCase   = (data)     => req('POST',   '/test-cases',        data);
export const updateTestCase   = (id, data) => req('PUT',    `/test-cases/${id}`,  data);
export const deleteTestCase   = (id)       => req('DELETE', `/test-cases/${id}`);
