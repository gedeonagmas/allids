import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

/**
 * Pipe that skips validation for multipart/form-data requests
 */
@Injectable()
export class SkipMultipartValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // Skip validation for multipart/form-data
    if (metadata.type === 'body' && value && typeof value === 'object') {
      return value;
    }
    return value;
  }
}

