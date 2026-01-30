import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { DocumentType } from '@prisma/client';

export interface RegulaDocumentField {
  fieldName: string;
  fieldType: string;
  value: string;
  validity: string;
  comparisonStatus?: string;
}

export interface RegulaVerificationResult {
  status: 'success' | 'failure' | 'error';
  documentType: DocumentType;
  fields: RegulaDocumentField[];
  validity: {
    overall: 'valid' | 'invalid' | 'warning';
    authenticity: 'valid' | 'invalid' | 'warning';
    imageQuality: 'valid' | 'invalid' | 'warning';
  };
  images?: {
    front?: string; // base64
    back?: string; // base64
  };
  error?: string;
}

@Injectable()
export class RegulaService {
  private readonly logger = new Logger(RegulaService.name);
  private readonly apiClient: AxiosInstance;
  private readonly mode: 'test' | 'real-api';
  private readonly apiKey?: string;
  private readonly baseUrl: string;

  constructor() {
    this.mode = (process.env.REGULA_MODE || 'test') as 'test' | 'real-api';
    this.apiKey = process.env.REGULA_API_KEY;
    this.baseUrl = process.env.REGULA_API_URL || 'https://api.regulaforensics.com';

    this.apiClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(this.mode === 'real-api' && this.apiKey && { 'X-API-Key': this.apiKey }),
      },
    });

    this.logger.log(`Regula service initialized in ${this.mode} mode`);
  }

  /**
   * Verify a document using Regula API
   * @param imageBase64 Base64 encoded image of the document
   * @param documentType Type of document (PASSPORT, NATIONAL_ID, DRIVER_LICENSE)
   * @param isValid Optional: For test mode only - controls verification success/failure. Ignored in real-api mode.
   * @returns Verification result with extracted fields
   */
  async verifyDocument(
    imageBase64: string,
    documentType: DocumentType,
    isValid?: boolean,
  ): Promise<RegulaVerificationResult> {
    if (this.mode === 'test') {
      return this.mockVerification(imageBase64, documentType, isValid);
    }

    // isValid parameter is ignored in real-api mode
    return this.realApiVerification(imageBase64, documentType);
  }

  /**
   * Mock verification for testing without API key
   * 
   * @param isValid Optional: If provided, uses this value to determine success/failure.
   *                If not provided, randomly succeeds ~80% of the time to simulate
   *                real-world scenarios where documents might be rejected.
   * 
   * NOTE: In test mode, you can control verification result by passing `isValid` in the request body.
   * When you switch to REGULA_MODE=real-api, verification will be based on actual
   * Regula API analysis of your document images, and `isValid` will be ignored.
   */
  private async mockVerification(
    imageBase64: string,
    documentType: DocumentType,
    isValid?: boolean,
  ): Promise<RegulaVerificationResult> {
    this.logger.debug(`Mock verification for ${documentType}`);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate mock fields based on document type
    const mockFields = this.generateMockFields(documentType);

    // Determine validity:
    // - If isValid is provided, use it (allows manual control in test mode)
    // - Otherwise, randomly determine validity (80% success rate for testing)
    const verificationResult = isValid !== undefined 
      ? isValid 
      : Math.random() > 0.2;

    if (isValid !== undefined) {
      this.logger.debug(`Mock verification result: ${verificationResult ? 'success' : 'failure'} (manually controlled)`);
    } else if (!verificationResult) {
      this.logger.debug(`Mock verification failed (simulated random rejection)`);
    }

    return {
      status: verificationResult ? 'success' : 'failure',
      documentType,
      fields: mockFields,
      validity: {
        overall: verificationResult ? 'valid' : 'invalid',
        authenticity: verificationResult ? 'valid' : 'invalid',
        imageQuality: 'valid',
      },
      images: {
        front: imageBase64.substring(0, 100) + '...', // Truncated for mock
      },
    };
  }

  /**
   * Real Regula API verification
   * Regula Document Reader API endpoint: /api/document-reader
   */
  private async realApiVerification(
    imageBase64: string,
    documentType: DocumentType,
  ): Promise<RegulaVerificationResult> {
    if (!this.apiKey) {
      throw new BadRequestException('REGULA_API_KEY is required for real API mode');
    }

    try {
      // Map document types to Regula's document type codes
      const regulaDocType = this.mapDocumentTypeToRegula(documentType);

      // Remove data URL prefix if present
      const cleanBase64 = imageBase64.includes(',') 
        ? imageBase64.split(',')[1] 
        : imageBase64;

      // Regula Document Reader API request format
      // Endpoint: POST /api/document-reader
      const requestBody = {
        image: cleanBase64,
        processParam: {
          scenario: 'MrzAndOcr', // MRZ and OCR processing
          alreadyCropped: false,
          returnCroppedBarcode: false,
        },
        light: regulaDocType, // Document type hint
      };

      const response = await this.apiClient.post('/api/document-reader', requestBody);

      // Transform Regula response to our format
      return this.transformRegulaResponse(response.data, documentType);
    } catch (error: any) {
      this.logger.error(`Regula API error: ${error.message}`, error.stack);
      
      if (error.response) {
        const errorMessage = error.response.data?.error || 
                            error.response.data?.message || 
                            error.response.statusText;
        throw new BadRequestException(
          `Regula API error (${error.response.status}): ${errorMessage}`,
        );
      }
      
      throw new BadRequestException(`Failed to verify document: ${error.message}`);
    }
  }

  /**
   * Map our DocumentType to Regula's document type codes
   */
  private mapDocumentTypeToRegula(documentType: DocumentType): string {
    const mapping = {
      PASSPORT: 'passport',
      NATIONAL_ID: 'id',
      DRIVER_LICENSE: 'driverLicense',
    };
    return mapping[documentType] || 'id';
  }

  /**
   * Transform Regula API response to our format
   * Regula returns data in a specific structure:
   * - text: { fieldName: value, ... }
   * - authenticity: { overall: { status }, ... }
   * - images: { front, back }
   */
  private transformRegulaResponse(
    regulaData: any,
    documentType: DocumentType,
  ): RegulaVerificationResult {
    const fields: RegulaDocumentField[] = [];
    
    // Extract text fields from Regula response
    // Regula returns fields in the 'text' object
    if (regulaData.text && typeof regulaData.text === 'object') {
      Object.keys(regulaData.text).forEach((fieldName) => {
        const fieldValue = regulaData.text[fieldName];
        
        // Skip null/undefined values and status fields
        if (fieldValue != null && !fieldName.toLowerCase().endsWith('status')) {
          fields.push({
            fieldName,
            fieldType: this.inferFieldType(fieldValue),
            value: String(fieldValue),
            validity: regulaData.text[fieldName + 'Status'] || 'valid',
            comparisonStatus: regulaData.text[fieldName + 'ComparisonStatus'],
          });
        }
      });
    }

    // Determine overall validity from authenticity check
    const authenticityStatus = regulaData.authenticity?.overall?.status || 
                              regulaData.authenticity?.overall?.result ||
                              'unknown';
    const isValid = authenticityStatus === 'ok' || 
                    authenticityStatus === 'valid' || 
                    authenticityStatus === 'success';

    // Check image quality
    const imageQualityStatus = regulaData.imageQuality?.overall?.status ||
                              regulaData.imageQuality?.overall?.result ||
                              'unknown';
    const hasGoodQuality = imageQualityStatus === 'ok' || imageQualityStatus === 'good';

    return {
      status: isValid && hasGoodQuality ? 'success' : 'failure',
      documentType,
      fields,
      validity: {
        overall: isValid && hasGoodQuality ? 'valid' : 'invalid',
        authenticity: isValid ? 'valid' : 'invalid',
        imageQuality: hasGoodQuality ? 'valid' : 'warning',
      },
      images: {
        front: regulaData.images?.front,
        back: regulaData.images?.back,
      },
    };
  }

  /**
   * Infer field type from value
   */
  private inferFieldType(value: any): string {
    if (typeof value === 'number') {
      return 'number';
    }
    if (typeof value === 'boolean') {
      return 'boolean';
    }
    if (typeof value === 'string') {
      // Check if it's a date
      if (/^\d{4}-\d{2}-\d{2}/.test(value) || /^\d{2}\/\d{2}\/\d{4}/.test(value)) {
        return 'date';
      }
      return 'string';
    }
    return 'string';
  }

  /**
   * Generate mock fields for testing
   */
  private generateMockFields(documentType: DocumentType): RegulaDocumentField[] {
    const baseFields: RegulaDocumentField[] = [
      {
        fieldName: 'firstName',
        fieldType: 'string',
        value: 'John',
        validity: 'valid',
      },
      {
        fieldName: 'lastName',
        fieldType: 'string',
        value: 'Doe',
        validity: 'valid',
      },
      {
        fieldName: 'dateOfBirth',
        fieldType: 'date',
        value: '1990-01-15',
        validity: 'valid',
      },
      {
        fieldName: 'nationality',
        fieldType: 'string',
        value: 'USA',
        validity: 'valid',
      },
      {
        fieldName: 'issuerCountry',
        fieldType: 'string',
        value: 'USA',
        validity: 'valid',
      },
    ];

    switch (documentType) {
      case 'PASSPORT':
        return [
          ...baseFields,
          {
            fieldName: 'documentNumber',
            fieldType: 'string',
            value: 'P12345678',
            validity: 'valid',
          },
          {
            fieldName: 'dateOfExpiry',
            fieldType: 'date',
            value: '2030-12-31',
            validity: 'valid',
          },
          {
            fieldName: 'sex',
            fieldType: 'string',
            value: 'M',
            validity: 'valid',
          },
          {
            fieldName: 'personalNumber',
            fieldType: 'string',
            value: '123456789',
            validity: 'valid',
          },
        ];

      case 'NATIONAL_ID':
        return [
          ...baseFields,
          {
            fieldName: 'documentNumber',
            fieldType: 'string',
            value: 'ID98765432',
            validity: 'valid',
          },
          {
            fieldName: 'dateOfExpiry',
            fieldType: 'date',
            value: '2028-06-30',
            validity: 'valid',
          },
          {
            fieldName: 'address',
            fieldType: 'string',
            value: '123 Main St, City, State 12345',
            validity: 'valid',
          },
        ];

      case 'DRIVER_LICENSE':
        return [
          ...baseFields,
          {
            fieldName: 'licenseNumber',
            fieldType: 'string',
            value: 'DL123456789',
            validity: 'valid',
          },
          {
            fieldName: 'dateOfExpiry',
            fieldType: 'date',
            value: '2027-05-20',
            validity: 'valid',
          },
          {
            fieldName: 'address',
            fieldType: 'string',
            value: '123 Main St, City, State 12345',
            validity: 'valid',
          },
          {
            fieldName: 'licenseClass',
            fieldType: 'string',
            value: 'B',
            validity: 'valid',
          },
        ];

      default:
        return baseFields;
    }
  }
}

