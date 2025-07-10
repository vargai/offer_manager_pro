
import React, { useState } from 'react';
import { OfferRequestFormData, Company } from '../types';
import { OfferService } from '../services/OfferService';
import { GeminiService } from '../services/GeminiService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { TrashIcon, SparklesIcon } from '../components/common/Icons';
import { useNavigate } from 'react-router-dom';


const CreateRequestPage: React.FC = () => {
  const [formData, setFormData] = useState<OfferRequestFormData>({
    title: '',
    description: '',
    keywords: '',
    requirements: '',
    dueDate: '',
    companies: [{ name: '', email: '' }],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCompanyChange = (index: number, field: keyof Omit<Company, 'id'>, value: string) => {
    const updatedCompanies = [...formData.companies];
    updatedCompanies[index] = { ...updatedCompanies[index], [field]: value };
    setFormData(prev => ({ ...prev, companies: updatedCompanies }));
  };

  const addCompanyField = () => {
    setFormData(prev => ({
      ...prev,
      companies: [...prev.companies, { name: '', email: '' }],
    }));
  };

  const removeCompanyField = (index: number) => {
    if (formData.companies.length > 1) {
      const updatedCompanies = formData.companies.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, companies: updatedCompanies }));
    }
  };

  const handleGenerateDescription = async () => {
    if (!formData.keywords.trim()) {
      alert("Please enter some keywords to generate the description.");
      return;
    }
    setIsAiLoading(true);
    try {
      const generatedDescription = await GeminiService.generateOfferDescription(formData.keywords);
      setFormData(prev => ({ ...prev, description: generatedDescription }));
    } catch (error) {
      console.error("AI description generation failed:", error);
      alert("Failed to generate description. Check console for details.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    // Basic validation
    if (!formData.title || !formData.dueDate || formData.companies.some(c => !c.name || !c.email)) {
        alert("Please fill in all required fields, including at least one company with name and email.");
        setIsLoading(false);
        return;
    }
    if (new Date(formData.dueDate) <= new Date()) {
        alert("Due date must be in the future.");
        setIsLoading(false);
        return;
    }

    try {
      await OfferService.createOfferRequest({
        title: formData.title,
        description: formData.description,
        keywords: formData.keywords,
        requirements: formData.requirements,
        dueDate: formData.dueDate,
        companies: formData.companies.filter(c => c.name && c.email), // Filter out empty company entries
      });
      alert('Offer request created successfully! Check console for simulated email links.');
      navigate('/'); // Navigate to dashboard
    } catch (error) {
      console.error("Failed to create offer request:", error);
      alert("Error: Could not create offer request.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-2xl">
      <h1 className="text-3xl font-bold text-slate-800 mb-8 text-center">Create New Offer Request</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Request Title <span className="text-red-500">*</span></label>
          <input
            type="text"
            name="title"
            id="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 transition-colors"
            placeholder="e.g., New Website Design"
          />
        </div>

        <div>
          <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-1">Keywords for AI Description</label>
          <input
            type="text"
            name="keywords"
            id="keywords"
            value={formData.keywords}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 transition-colors"
            placeholder="e.g., modern, responsive, e-commerce, SEO optimized"
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            id="description"
            rows={4}
            value={formData.description}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 transition-colors"
            placeholder="Detailed description of what you need..."
          ></textarea>
          <button
            type="button"
            onClick={handleGenerateDescription}
            disabled={isAiLoading || !process.env.API_KEY}
            className="mt-2 flex items-center px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-lg hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:bg-gray-300 transition-colors"
          >
            {isAiLoading ? <LoadingSpinner size="sm" /> : <SparklesIcon className="w-4 h-4 mr-2" />}
            Generate with AI
          </button>
          {!process.env.API_KEY && <p className="text-xs text-red-500 mt-1">Gemini API Key not configured. AI generation disabled.</p>}
        </div>

        <div>
          <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-1">Specific Requirements</label>
          <textarea
            name="requirements"
            id="requirements"
            rows={3}
            value={formData.requirements}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 transition-colors"
            placeholder="List key deliverables, technical specs, etc."
          ></textarea>
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">Due Date <span className="text-red-500">*</span></label>
          <input
            type="date"
            name="dueDate"
            id="dueDate"
            value={formData.dueDate}
            onChange={handleInputChange}
            min={today}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 transition-colors"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800 border-b pb-2">Companies to Invite <span className="text-red-500">*</span></h3>
          {formData.companies.map((company, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3 bg-gray-50">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-gray-600">Company #{index + 1}</p>
                {formData.companies.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCompanyField(index)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove Company"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
              <div>
                <label htmlFor={`companyName-${index}`} className="block text-xs font-medium text-gray-600">Company Name</label>
                <input
                  type="text"
                  id={`companyName-${index}`}
                  value={company.name}
                  onChange={(e) => handleCompanyChange(index, 'name', e.target.value)}
                  required
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-sm"
                  placeholder="Company Name"
                />
              </div>
              <div>
                <label htmlFor={`companyEmail-${index}`} className="block text-xs font-medium text-gray-600">Company Email</label>
                <input
                  type="email"
                  id={`companyEmail-${index}`}
                  value={company.email}
                  onChange={(e) => handleCompanyChange(index, 'email', e.target.value)}
                  required
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-sm"
                  placeholder="company@example.com"
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addCompanyField}
            className="mt-2 px-4 py-2 border border-dashed border-gray-400 text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
          >
            + Add Another Company
          </button>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-lg text-white bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-300 transition-all duration-150 ease-in-out"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Create Offer Request & Send Invitations'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRequestPage;
    