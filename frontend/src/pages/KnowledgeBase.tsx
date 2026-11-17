import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Upload,
  Search,
  FileText,
  CheckCircle2,
  AlertCircle,
  FileSearch,
  Trash2,
  RefreshCw,
  X
} from 'lucide-react';
import api from '../services/api';
import { KnowledgeDocument, KnowledgeSearchResponse } from '../types';

export const KnowledgeBase: React.FC = () => {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState('What is the auto-reversal SLA timeline for failed UPI payments?');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<KnowledgeSearchResponse | null>(null);

  // Upload modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Payment processing procedures');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/knowledge/documents');
      setDocuments(res.data);
    } catch (e) {
      console.error('Failed to fetch knowledge documents', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    try {
      const res = await api.post('/knowledge/search', {
        query: searchQuery,
        top_k: 3
      });
      setSearchResult(res.data);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', uploadTitle);
      formData.append('category', uploadCategory);
      formData.append('file', selectedFile);

      await api.post('/knowledge/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadModalOpen(false);
      setUploadTitle('');
      setSelectedFile(null);
      fetchDocuments();
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: number) => {
    if (!window.confirm('Are you sure you want to delete this document from the vector store?')) return;
    try {
      await api.delete(`/knowledge/documents/${docId}`);
      fetchDocuments();
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            RAG-Based Banking Knowledge Base
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Institutional banking SOPs, Central Bank compliance guidelines & grounded semantic vector search
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-navy-800 hover:bg-navy-900 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
        >
          <Upload className="w-3.5 h-3.5" /> Upload Document
        </button>
      </div>

      {/* RAG Semantic Search Console */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <FileSearch className="w-4 h-4 text-navy-700" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Semantic Vector Policy Retrieval Console
          </h3>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search banking SOPs, ATM troubleshooting codes, T+1 SLAs..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-navy-600"
            />
          </div>
          <button
            type="submit"
            disabled={searchLoading}
            className="flex items-center justify-center gap-2 px-5 py-2 bg-navy-800 hover:bg-navy-900 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-xs transition-colors shrink-0"
          >
            {searchLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            Retrieve & Synthesize
          </button>
        </form>

        {/* Search Result & Citations */}
        {searchResult && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 animate-fadeIn">
            {/* Answer Box */}
            <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
              searchResult.grounded
                ? 'bg-emerald-50/60 border-emerald-200 text-slate-800'
                : 'bg-amber-50/60 border-amber-200 text-amber-900'
            }`}>
              <div className="flex items-center gap-2 font-bold mb-2">
                {searchResult.grounded ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-950 uppercase tracking-wider text-[11px]">
                      Grounded Answer (Backed by Policy Vectors)
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span className="text-amber-950 uppercase tracking-wider text-[11px]">
                      Knowledge Base Boundary Limitation
                    </span>
                  </>
                )}
              </div>
              <div className="whitespace-pre-line text-slate-800">{searchResult.answer}</div>
            </div>

            {/* Citations list */}
            {searchResult.sources.length > 0 && (
              <div>
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2">
                  Retrieved Policy Passages & Relevance Scores:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {searchResult.sources.map((src, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-navy-900 truncate">{src.document_title}</span>
                        <span className="font-mono text-[10px] bg-navy-100 text-navy-800 px-1.5 py-0.5 rounded font-bold">
                          {(src.similarity_score * 100).toFixed(1)}% Match
                        </span>
                      </div>
                      <div className="text-[10px] font-semibold text-slate-500 uppercase">
                        Section: {src.section_name || 'General'}
                      </div>
                      <p className="text-slate-600 line-clamp-4 leading-normal text-[11px]">
                        "{src.content}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Document Ingestion Repository */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Ingested Knowledge Documents & Policy Chunks
            </h3>
            <p className="text-[11px] text-slate-500">Vectorized and indexed in institutional memory</p>
          </div>
          <span className="text-xs font-bold text-navy-800 bg-navy-100 px-2 py-0.5 rounded-full">
            {documents.length} Active Documents
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Document Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Chunks</th>
                <th className="py-3 px-4 text-center">Format</th>
                <th className="py-3 px-4">Uploaded By</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-navy-700 shrink-0" />
                    <span>{doc.title}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 truncate">{doc.category}</td>
                  <td className="py-3 px-4 text-center font-bold text-navy-700">{doc.total_chunks}</td>
                  <td className="py-3 px-4 text-center uppercase font-mono text-[10px] text-slate-500">
                    {doc.file_type}
                  </td>
                  <td className="py-3 px-4 text-slate-600 truncate">{doc.uploaded_by}</td>
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-scaleIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Upload Banking Document</h3>
              <button onClick={() => setUploadModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>
            <form onSubmit={handleUpload} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. Card Chargeback Settlement Guidelines 2025"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                >
                  <option value="Payment processing procedures">Payment processing procedures</option>
                  <option value="ATM troubleshooting">ATM troubleshooting</option>
                  <option value="Debit and credit card support">Debit and credit card support</option>
                  <option value="Mobile and Internet banking issues">Mobile and Internet banking issues</option>
                  <option value="Service-level agreements">Service-level agreements</option>
                  <option value="Banking operational policies">Banking operational policies</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select File (TXT, PDF, DOCX) *</label>
                <input
                  type="file"
                  required
                  accept=".txt,.pdf,.docx"
                  onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-navy-800 file:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !selectedFile}
                  className="px-4 py-1.5 rounded-lg bg-navy-800 text-white font-bold disabled:opacity-50"
                >
                  {uploading ? 'Processing Chunks...' : 'Upload & Vectorize'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
