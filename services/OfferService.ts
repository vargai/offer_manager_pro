import { apiFetch, apiUploadFile } from './api';
import { OfferRequest, OfferSubmission, Attachment } from '../types';

export const OfferService = {
  generateId: (): string => Math.random().toString(36).substr(2, 9),

  async createOfferRequest(requestData: Omit<OfferRequest, 'id' | 'status' | 'createdAt' | 'companies'> & { companies: Array<{ name: string; email: string }> }): Promise<OfferRequest> {
    // Call backend instead of localStorage
    return apiFetch('/requests', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  },

  async getOfferRequests(): Promise<OfferRequest[]> {
    return apiFetch('/requests');
  },

  async getOfferRequestById(id: string): Promise<OfferRequest | undefined> {
    return apiFetch('/requests').then((list: any[]) => list.find((req: any) => req.id === id));
  },

  async submitOffer(offerRequestId: string, submissionData: Omit<OfferSubmission, 'id' | 'offerRequestId' | 'submittedAt' | 'status' | 'attachments'>, files: File[]): Promise<OfferSubmission> {
    // Upload files first
    const attachments: Attachment[] = [];
    for (const file of files) {
      const uploaded = await apiUploadFile(file);
      attachments.push({
        id: uploaded.filename,
        name: uploaded.originalname,
        type: file.type,
        size: file.size,
        mockUrl: `/api/files/${uploaded.filename}`,
      });
    }
    return apiFetch('/offers', {
      method: 'POST',
      body: JSON.stringify({ ...submissionData, requestId: offerRequestId, attachments }),
    });
  },

  async getSubmissionsForRequest(offerRequestId: string): Promise<OfferSubmission[]> {
    return apiFetch('/offers').then((list: any[]) => list.filter((o: any) => o.requestId === offerRequestId));
  },

  async updateOfferRequestStatus(_offerRequestId: string, _status: OfferRequest['status']): Promise<OfferRequest | undefined> {
    // Not implemented in backend, fallback to get
    return undefined;
  },

  async updateOfferSubmissionStatus(_submissionId: string, _status: OfferSubmission['status']): Promise<OfferSubmission | undefined> {
    // Not implemented in backend, fallback to get
    return undefined;
  },
};
