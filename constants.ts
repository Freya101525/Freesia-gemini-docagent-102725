import type { Document, Agent, Theme } from './types';

export const DOCUMENT_TITLES: string[] = [
    "製造商基本資料 (Manufacturer Information)",
    "醫療器材許可證 (Medical Device License)",
    "品質系統文件 (Quality System Documentation)",
    "臨床評估報告 (Clinical Evaluation Report)",
    "風險管理文件 (Risk Management File)"
];

export const INITIAL_DOCUMENTS: Document[] = DOCUMENT_TITLES.map((title, index) => ({
    id: index + 1,
    title,
    content: "",
    fileName: null,
    summary: "",
}));

export const INITIAL_AGENTS: Agent[] = [
    { 
        id: 'compliance', 
        name: 'Compliance Checker', 
        prompt: 'Analyze the provided context for compliance with medical device regulations (e.g., QMS, FDA regulations). Identify any potential non-compliance issues, inconsistencies, or gaps. Cite the relevant document sections that support your findings. Format the output as a markdown list.', 
        model: 'gemini-2.5-flash', 
        enabled: true 
    },
    { 
        id: 'risk', 
        name: 'Risk Assessor', 
        prompt: 'Based on the context, identify and categorize potential risks (e.g., patient safety, regulatory, operational, data integrity). For each identified risk, assess its potential severity and likelihood. Suggest mitigation strategies for high-priority risks. Present the analysis in a markdown table format.', 
        model: 'gemini-2.5-flash', 
        enabled: true 
    },
    { 
        id: 'improvement', 
        name: 'Process Improvement Analyst', 
        prompt: 'Review the documents and identify opportunities for process improvement, efficiency gains, or enhanced clarity in documentation. Suggest actionable recommendations to strengthen the overall quality and risk management framework. Use markdown bullet points for your suggestions.', 
        model: 'gemini-2.5-flash', 
        enabled: true 
    },
];

export const FLOWER_THEMES: Theme[] = [
  { name: 'Default (Sky)', colors: { '--primary-bg': '#FFFFFF', '--secondary-bg': '#F1F5F9', '--primary-text': '#1E293B', '--secondary-text': '#475569', '--accent-color': '#0EA5E9', '--accent-text': '#FFFFFF', '--border-color': '#CBD5E1' } },
  { name: 'Rose', colors: { '--primary-bg': '#FFF5F5', '--secondary-bg': '#FFE0E0', '--primary-text': '#5C2B29', '--secondary-text': '#8C4B49', '--accent-color': '#E53E3E', '--accent-text': '#FFFFFF', '--border-color': '#FED7D7' } },
  { name: 'Lavender', colors: { '--primary-bg': '#F9F5FF', '--secondary-bg': '#F3E8FF', '--primary-text': '#4C1D95', '--secondary-text': '#6D28D9', '--accent-color': '#8B5CF6', '--accent-text': '#FFFFFF', '--border-color': '#E9D5FF' } },
  { name: 'Sunflower', colors: { '--primary-bg': '#FFFFF0', '--secondary-bg': '#FEFBC3', '--primary-text': '#713F12', '--secondary-text': '#854D0E', '--accent-color': '#FBBF24', '--accent-text': '#1F2937', '--border-color': '#FDE68A' } },
  { name: 'Lily', colors: { '--primary-bg': '#F0FFF4', '--secondary-bg': '#E6FFFA', '--primary-text': '#276749', '--secondary-text': '#2F855A', '--accent-color': '#48BB78', '--accent-text': '#FFFFFF', '--border-color': '#C6F6D5' } },
  { name: 'Orchid', colors: { '--primary-bg': '#FAF5FF', '--secondary-bg': '#F3E8FF', '--primary-text': '#5B21B6', '--secondary-text': '#7C3AED', '--accent-color': '#A78BFA', '--accent-text': '#1E293B', '--border-color': '#DDD6FE' } },
  { name: 'Tulip', colors: { '--primary-bg': '#FFF5F7', '--secondary-bg': '#FFE4E6', '--primary-text': '#831843', '--secondary-text': '#9D174D', '--accent-color': '#EC4899', '--accent-text': '#FFFFFF', '--border-color': '#FBCFE8' } },
  { name: 'Daisy', colors: { '--primary-bg': '#FBFEFD', '--secondary-bg': '#F0FEF8', '--primary-text': '#064E3B', '--secondary-text': '#057A55', '--accent-color': '#10B981', '--accent-text': '#FFFFFF', '--border-color': '#A7F3D0' } },
  { name: 'Marigold', colors: { '--primary-bg': '#FFFBF0', '--secondary-bg': '#FFF2D4', '--primary-text': '#854A0E', '--secondary-text': '#A16207', '--accent-color': '#F59E0B', '--accent-text': '#FFFFFF', '--border-color': '#FCD34D' } },
  { name: 'Peony', colors: { '--primary-bg': '#FEF2F2', '--secondary-bg': '#FEE2E2', '--primary-text': '#7F1D1D', '--secondary-text': '#991B1B', '--accent-color': '#EF4444', '--accent-text': '#FFFFFF', '--border-color': '#FECACA' } },
  { name: 'Iris', colors: { '--primary-bg': '#F5F3FF', '--secondary-bg': '#EDE9FE', '--primary-text': '#3730A3', '--secondary-text': '#4338CA', '--accent-color': '#6366F1', '--accent-text': '#FFFFFF', '--border-color': '#C7D2FE' } },
  { name: 'Hydrangea', colors: { '--primary-bg': '#EFF6FF', '--secondary-bg': '#DBEAFE', '--primary-text': '#1E3A8A', '--secondary-text': '#1D4ED8', '--accent-color': '#3B82F6', '--accent-text': '#FFFFFF', '--border-color': '#BFDBFE' } },
  { name: 'Poppy', colors: { '--primary-bg': '#FFF7ED', '--secondary-bg': '#FFEDD5', '--primary-text': '#7C2D12', '--secondary-text': '#9A3412', '--accent-color': '#F97316', '--accent-text': '#FFFFFF', '--border-color': '#FED7AA' } },
  { name: 'Daffodil', colors: { '--primary-bg': '#FEFDE8', '--secondary-bg': '#FEF9C3', '--primary-text': '#713F12', '--secondary-text': '#854D0E', '--accent-color': '#EAB308', '--accent-text': '#FFFFFF', '--border-color': '#FDE047' } },
  { name: 'Crocus', colors: { '--primary-bg': '#FBF5FF', '--secondary-bg': '#F3E8FF', '--primary-text': '#581C87', '--secondary-text': '#6B21A8', '--accent-color': '#9333EA', '--accent-text': '#FFFFFF', '--border-color': '#E9D5FF' } },
  { name: 'Cherry Blossom', colors: { '--primary-bg': '#FFF6F6', '--secondary-bg': '#FFE4E4', '--primary-text': '#991B1B', '--secondary-text': '#A52A2A', '--accent-color': '#F472B6', '--accent-text': '#FFFFFF', '--border-color': '#FECDD3' } },
  { name: 'Bluebell', colors: { '--primary-bg': '#F0F9FF', '--secondary-bg': '#E0F2FE', '--primary-text': '#0C4A6E', '--secondary-text': '#075985', '--accent-color': '#0EA5E9', '--accent-text': '#FFFFFF', '--border-color': '#BAE6FD' } },
  { name: 'Carnation', colors: { '--primary-bg': '#FFF1F2', '--secondary-bg': '#FFE4E6', '--primary-text': '#881337', '--secondary-text': '#9F1239', '--accent-color': '#DB2777', '--accent-text': '#FFFFFF', '--border-color': '#F9A8D4' } },
  { name: 'Geranium', colors: { '--primary-bg': '#FDF2F8', '--secondary-bg': '#FCE7F3', '--primary-text': '#831843', '--secondary-text': '#9D174D', '--accent-color': '#D946EF', '--accent-text': '#FFFFFF', '--border-color': '#F5D0FE' } },
  { name: 'Begonia', colors: { '--primary-bg': '#FFF7F5', '--secondary-bg': '#FFEAE5', '--primary-text': '#8D2B0B', '--secondary-text': '#A3330C', '--accent-color': '#FF6B6B', '--accent-text': '#FFFFFF', '--border-color': '#FFD0D0' } }
];