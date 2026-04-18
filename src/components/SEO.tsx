import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
}

export default function SEO({ title, description, keywords, image, url }: SEOProps) {
  const siteTitle = 'GAME VEXO';
  const fullTitle = title === 'Home' ? siteTitle : `${title} - ${siteTitle}`;
  const defaultImage = 'https://i.ibb.co/N21dNzw7/logo.jpg';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image || defaultImage} />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="GAME VEXO" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image || defaultImage} />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "GAME VEXO",
          "alternateName": ["GameVexo", "Game Vexo"],
          "url": "https://gamevexo.com/"
        })}
      </script>
    </Helmet>
  );
}
