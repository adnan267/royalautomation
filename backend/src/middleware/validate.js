import { HttpError } from '../utils/httpError.js';

/** Validates req[source] against a zod schema and replaces it with the parsed value. */
export const validate =
  (schema, source = 'body') =>
  (req, _res, next) => {
    const result = schema.safeParse(req[source] ?? {});
    if (!result.success) {
      const fields = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join('.') || '_';
        if (!fields[key]) fields[key] = issue.message;
      }
      return next(new HttpError(422, 'Please check the highlighted fields.', fields));
    }
    req.validated = result.data;
    return next();
  };
