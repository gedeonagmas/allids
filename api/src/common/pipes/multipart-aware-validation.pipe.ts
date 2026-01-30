import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class MultipartAwareValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype, type }: ArgumentMetadata) {
    // Skip validation for multipart/form-data requests (handled by FileInterceptor)
    if (type === 'body' && value && typeof value === 'object') {
      // Check if this looks like a multipart request (has file-like properties)
      if (value.constructor === Object && Object.keys(value).length === 0) {
        // Empty object might be multipart, skip validation
        return value;
      }
    }

    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      throw new BadRequestException(
        errors.map((err) => Object.values(err.constraints || {})).flat(),
      );
    }

    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}

