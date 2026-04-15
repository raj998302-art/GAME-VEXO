import React from 'react';
import SEO from '../components/SEO';

export default function LegalPage({ title, content }: { title: string, content: React.ReactNode }) {
  return (
    <>
      <SEO title={title} description={`${title} for GameVexo.`} />
      <div className="max-w-4xl mx-auto py-12">
        <h1 className="text-4xl font-bold mb-8">{title}</h1>
        <div className="prose prose-invert max-w-none glass-panel p-8 rounded-2xl">
          {content}
        </div>
      </div>
    </>
  );
}
