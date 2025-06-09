import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    res.status(400).json({
      message: 'Validation Error',
      errors: err.message,
    });
    return;
  }

  if (err.name === 'CastError') {
    res.status(400).json({
      message: 'Invalid ID format',
    });
    return;
  }

  if (err.name === 'MongoError' && (err as any).code === 11000) {
    res.status(400).json({
      message: 'Duplicate key error',
    });
    return;
  }

  res.status(500).json({
    message: 'Internal Server Error',
  });
}; 