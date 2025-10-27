import React, { useState, useCallback, useEffect } from 'react';
import { INITIAL_DOCUMENTS, INITIAL_AGENTS, FLOWER_THEMES } from './constants';
import type { Document, Agent, AgentResult, Theme } from './types';
import * as apiService from './services/apiService';

import StepIndicator from './components/StepIndicator';
import LoadingSpinner from './components/LoadingSpinner';
import DocumentInput from './components/DocumentInput';
import MarkdownRenderer from './components/MarkdownRenderer';
import WordCloud from './components/WordCloud';
import ThemeSelector from './components/ThemeSelector';

const App: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [documents, setDocuments] = useState<Document[]>(INITIAL_DOCUMENTS);
    const [summary, setSummary] = useState<string>('');
    const [extractedData, setExtractedData] = useState<Record<string, any> | null>(null);
    const [documentToExtract, setDocumentToExtract] = useState<number>(INITIAL_DOCUMENTS[0].id);
    const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
    const [agentResults, setAgentResults] = useState<AgentResult[]>([]);
    const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
    const [theme, setTheme] = useState<Theme>(FLOWER_THEMES[0]);

    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [error, setError] = useState<string | null>(null);

    const steps = ["Input & Summarize", "Comprehensive Analysis", "Extract Data", "Configure Agents", "View Results"];

    useEffect(() => {
        Object.entries(theme.colors).forEach(([key, value]) => {
            document.documentElement.style.setProperty(key, value);
        });
    }, [theme]);

    const handleSetLoading = (loading: boolean, message: string = '') => {
        setIsLoading(loading);
        setLoadingMessage(message);
    };

    const handleUpdateDocument = useCallback((id: number, content: string, fileName: string | null) => {
        setDocuments(prev => prev.map(doc => doc.id === id ? { ...doc, content, fileName } : doc));
    }, []);

    const handleGenerateSingleSummary = async (id: number) => {
        setError(null);
        const doc = documents.find(d => d.id === id);
        if (!doc) return;

        handleSetLoading(true, `Summarizing "${doc.title}"...`);
        try {
            const result = await apiService.generateSingleDocumentSummary(doc.content, doc.title);
            setDocuments(prev => prev.map(d => d.id === id ? { ...d, summary: result } : d));
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            handleSetLoading(false);
        }
    };

    const handleGenerateComprehensiveAnalysis = async () => {
        setError(null);
        handleSetLoading(true, 'Generating comprehensive summary...');
        try {
            const summaries = documents.map(d => ({ title: d.title, summary: d.summary || '' }));
            const summaryResult = await apiService.generateComprehensiveSummary(summaries);
            setSummary(summaryResult);

            handleSetLoading(true, 'Generating follow-up questions...');
            const questions = await apiService.generateFollowUpQuestions(summaryResult);
            setFollowUpQuestions(questions);

            setCurrentStep(1);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            handleSetLoading(false);
        }
    };


    const handleExtractData = async () => {
        setError(null);
        const doc = documents.find(d => d.id === documentToExtract);
        if (!doc || !doc.content) {
            setError("Selected document has no content to extract.");
            return;
        }
        handleSetLoading(true, 'Extracting structured data...');
        try {
            const result = await apiService.extractData(doc.content);
            setExtractedData(result);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            handleSetLoading(false);
        }
    };
    
    const handleAgentConfigChange = (id: string, field: keyof Agent, value: any) => {
        setAgents(prev => prev.map(agent => agent.id === id ? { ...agent, [field]: value } : agent));
    };

    const handleExecuteAgents = async () => {
        setError(null);
        handleSetLoading(true, 'Executing AI agents...');
        try {
            const enabledAgents = agents.filter(a => a.enabled);
            const context = `**COMPREHENSIVE SUMMARY:**\n${summary}\n\n**EXTRACTED DATA:**\n${JSON.stringify(extractedData, null, 2)}`;
            
            const results: AgentResult[] = [];
            for (let i = 0; i < enabledAgents.length; i++) {
                handleSetLoading(true, `Executing agent ${i + 1}/${enabledAgents.length}: ${enabledAgents[i].name}...`);
                const result = await apiService.executeAgent(context, enabledAgents[i]);
                results.push({ agentId: enabledAgents[i].id, agentName: enabledAgents[i].name, result });
            }
            setAgentResults(results);
            setCurrentStep(4);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            handleSetLoading(false);
        }
    };
    
    const startOver = () => {
      setDocuments(INITIAL_DOCUMENTS);
      setSummary('');
      setExtractedData(null);
      setAgentResults([]);
      setFollowUpQuestions([]);
      setCurrentStep(0);
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                const allDocsProvided = documents.every(doc => doc.content.trim() !== '');
                return (
                    <div className="space-y-4">
                        {documents.map(doc => (
                            <DocumentInput key={doc.id} document={doc} onUpdate={handleUpdateDocument} onGenerateSummary={handleGenerateSingleSummary} setLoading={handleSetLoading} setError={setError} />
                        ))}
                        <div className="flex justify-end pt-4">
                            <button onClick={handleGenerateComprehensiveAnalysis} disabled={!allDocsProvided} className="px-6 py-2 font-semibold text-[var(--accent-text)] bg-[var(--accent-color)] rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-color)] disabled:bg-gray-400 disabled:cursor-not-allowed">
                                Generate Comprehensive Analysis
                            </button>
                        </div>
                    </div>
                );
            case 1:
                return (
                     <div className="space-y-6">
                        <div className="bg-[var(--primary-bg)] p-6 rounded-lg shadow-md border border-[var(--border-color)]">
                            <h2 className="text-xl font-bold text-[var(--primary-text)] mb-4">Comprehensive Summary</h2>
                             <div className="mt-4 prose max-w-none border-t border-[var(--border-color)] pt-4">
                                <MarkdownRenderer content={summary} />
                            </div>
                        </div>
                         <div className="bg-[var(--primary-bg)] p-6 rounded-lg shadow-md border border-[var(--border-color)]">
                          <h2 className="text-xl font-bold text-[var(--primary-text)] mb-4">Keyword Cloud</h2>
                           <WordCloud content={summary} />
                        </div>
                         <div className="bg-[var(--primary-bg)] p-6 rounded-lg shadow-md border border-[var(--border-color)]">
                          <h2 className="text-xl font-bold text-[var(--primary-text)] mb-4">Suggested Follow-up Questions</h2>
                          <ul className="list-disc list-inside space-y-2 text-[var(--secondary-text)]">
                            {followUpQuestions.map((q, i) => <li key={i}>{q}</li>)}
                          </ul>
                        </div>
                        <div className="flex justify-between pt-4 mt-4 border-t border-[var(--border-color)]">
                            <button onClick={() => setCurrentStep(0)} className="px-6 py-2 font-semibold text-[var(--primary-text)] bg-[var(--secondary-bg)] rounded-md hover:opacity-90">Back</button>
                            <button onClick={() => setCurrentStep(2)} className="px-6 py-2 font-semibold text-[var(--accent-text)] bg-[var(--accent-color)] rounded-md hover:opacity-90">Next: Extract Data</button>
                        </div>
                    </div>
                );
            case 2:
                 const jsonToMarkdownTable = (data: Record<string, any>) => {
                  if (!data || Object.keys(data).length === 0) return 'No data extracted.';
                  const headers = Object.keys(data);
                  const values = Object.values(data).map(v => String(v ?? '').replace(/\|/g, '\\|'));
                  return `| ${headers.join(' | ')} |\n| ${headers.map(() => '---').join(' | ')} |\n| ${values.join(' | ')} |`;
                };
                return (
                    <div className="bg-[var(--primary-bg)] p-6 rounded-lg shadow-md space-y-4 border border-[var(--border-color)]">
                        <h2 className="text-xl font-bold text-[var(--primary-text)]">Extract Structured Data</h2>
                        <div className="flex items-center gap-4 flex-wrap">
                          <label htmlFor="doc-select" className="font-medium text-[var(--secondary-text)]">Select Document:</label>
                          <select id="doc-select" value={documentToExtract} onChange={e => setDocumentToExtract(Number(e.target.value))} className="p-2 border border-[var(--border-color)] rounded-md focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)] bg-[var(--primary-bg)] text-[var(--primary-text)]">
                              {documents.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                          </select>
                          <button onClick={handleExtractData} className="px-6 py-2 font-semibold text-[var(--accent-text)] bg-[var(--accent-color)] rounded-md hover:opacity-90">Extract Data</button>
                        </div>
                        
                        {extractedData && (
                            <div className="space-y-4 pt-4 border-t border-[var(--border-color)]">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2 text-[var(--primary-text)]">Extracted Data (Table)</h3>
                                    <div className="p-4 bg-[var(--secondary-bg)] rounded-md">
                                        <MarkdownRenderer content={jsonToMarkdownTable(extractedData)} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold mb-2 text-[var(--primary-text)]">Extracted Data (JSON)</h3>
                                    <pre className="bg-slate-800 text-white p-4 rounded-md text-sm overflow-x-auto">
                                        <code>{JSON.stringify(extractedData, null, 2)}</code>
                                    </pre>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between pt-4 mt-4 border-t border-[var(--border-color)]">
                            <button onClick={() => setCurrentStep(1)} className="px-6 py-2 font-semibold text-[var(--primary-text)] bg-[var(--secondary-bg)] rounded-md hover:opacity-90">Back</button>
                            {extractedData && (
                                <button onClick={() => setCurrentStep(3)} className="px-6 py-2 font-semibold text-[var(--accent-text)] bg-[var(--accent-color)] rounded-md hover:opacity-90">Next: Configure Agents</button>
                            )}
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="bg-[var(--primary-bg)] p-6 rounded-lg shadow-md border border-[var(--border-color)]">
                        <h2 className="text-xl font-bold text-[var(--primary-text)] mb-4">Configure & Execute Agent Team</h2>
                        <div className="space-y-6">
                            {agents.map(agent => (
                                <div key={agent.id} className="p-4 border border-[var(--border-color)] rounded-lg bg-[var(--secondary-bg)]">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-[var(--primary-text)]">{agent.name}</h3>
                                        <input type="checkbox" checked={agent.enabled} onChange={e => handleAgentConfigChange(agent.id, 'enabled', e.target.checked)} className="h-5 w-5 rounded text-[var(--accent-color)] focus:ring-[var(--accent-color)] bg-[var(--primary-bg)] border-[var(--border-color)]"/>
                                    </div>
                                    <div className="mt-2">
                                        <label className="block text-sm font-medium text-[var(--secondary-text)]">Prompt:</label>
                                        <textarea value={agent.prompt} onChange={e => handleAgentConfigChange(agent.id, 'prompt', e.target.value)} className="w-full h-24 p-2 mt-1 border border-[var(--border-color)] rounded-md text-sm bg-[var(--primary-bg)] text-[var(--primary-text)]" disabled={!agent.enabled}/>
                                        <label className="block text-sm font-medium text-[var(--secondary-text)] mt-2">Model:</label>
                                        <select value={agent.model} onChange={e => handleAgentConfigChange(agent.id, 'model', e.target.value)} className="w-full p-2 mt-1 border border-[var(--border-color)] rounded-md text-sm bg-[var(--primary-bg)] text-[var(--primary-text)]" disabled={!agent.enabled}>
                                            <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                                            <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                        </div>
                         <div className="flex justify-between pt-4 mt-4 border-t border-[var(--border-color)]">
                            <button onClick={() => setCurrentStep(2)} className="px-6 py-2 font-semibold text-[var(--primary-text)] bg-[var(--secondary-bg)] rounded-md hover:opacity-90">Back</button>
                            <button onClick={handleExecuteAgents} className="px-6 py-2 font-semibold text-[var(--accent-text)] bg-[var(--accent-color)] rounded-md hover:opacity-90" disabled={!agents.some(a => a.enabled)}>Execute Agents</button>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="space-y-6">
                        {agentResults.map(res => (
                            <div key={res.agentId} className="bg-[var(--primary-bg)] p-6 rounded-lg shadow-md border border-[var(--border-color)]">
                                <h2 className="text-xl font-bold text-[var(--primary-text)] mb-4">{res.agentName} Analysis</h2>
                                <MarkdownRenderer content={res.result} />
                            </div>
                        ))}
                        <div className="flex justify-start pt-4 mt-4">
                            <button onClick={startOver} className="px-6 py-2 font-semibold text-[var(--accent-text)] bg-[var(--accent-color)] rounded-md hover:opacity-90">Start Over</button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };


    return (
        <div className="min-h-screen bg-[var(--secondary-bg)] font-sans text-[var(--primary-text)] transition-colors duration-300">
            {isLoading && <LoadingSpinner message={loadingMessage} />}
            <header className="bg-[var(--primary-bg)] shadow-sm border-b border-[var(--border-color)] sticky top-0 z-10">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold leading-tight text-[var(--primary-text)]">Agentic Document Processor</h1>
                        <p className="text-sm text-[var(--secondary-text)] mt-1">For Medical Device Manufacturing Documents</p>
                    </div>
                    <ThemeSelector themes={FLOWER_THEMES} onThemeChange={setTheme} />
                </div>
            </header>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-[var(--primary-bg)] p-6 rounded-lg shadow-md mb-6 border border-[var(--border-color)]">
                        <StepIndicator currentStep={currentStep} steps={steps} />
                    </div>
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
                            <strong className="font-bold">Error: </strong>
                            <span className="block sm:inline">{error}</span>
                            <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
                                <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                            </span>
                        </div>
                    )}
                    {renderStepContent()}
                </div>
            </main>
        </div>
    );
};

export default App;