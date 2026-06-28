// Standard API envelope used by every response. Shape is fixed per project spec:
// { success, message, data, error }.

export function ok(res, { data = null, message = 'OK', status = 200 } = {}) {
  return res.status(status).json({ success: true, message, data, error: null })
}

export function created(res, { data = null, message = 'Created' } = {}) {
  return ok(res, { data, message, status: 201 })
}

export function fail(res, { message = 'Error', status = 500, error = null } = {}) {
  return res.status(status).json({ success: false, message, data: null, error })
}
