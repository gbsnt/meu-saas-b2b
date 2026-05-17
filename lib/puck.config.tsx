import { Config, DropZone } from "@measured/puck";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/components/CartContext";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import ShippingCalculator from "@/components/ShippingCalculator";

// --- HELPERS E CUSTOM FIELDS ---

const useNamesMap = (table: 'products' | 'categories') => {
  const [map, setMap] = useState<Record<string, string>>({});
  useEffect(() => {
    supabase.from(table).select('id, name').then(({ data }) => {
      const newMap: Record<string, string> = {};
      data?.forEach(item => newMap[item.id] = item.name);
      setMap(newMap);
    });
  }, [table]);
  return map;
};

const ProductSelectorField = ({ value, onChange }: any) => {
  const [products, setProducts] = useState<any[]>([]);
  useEffect(() => {
    supabase.from('products').select('id, name').eq('is_active', true).then(({ data }) => setProducts(data || []));
  }, []);
  return (
    <select style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', backgroundColor: '#ffffff', color: '#111827', fontSize: '0.875rem', outline: 'none' }} value={value || ""} onChange={(e) => onChange(e.target.value)}>
      <option value="">Selecione um Produto...</option>
      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
    </select>
  );
};

const CategorySelectorField = ({ value, onChange }: any) => {
  const [categories, setCategories] = useState<any[]>([]);
  useEffect(() => {
    supabase.from('categories').select('id, name').then(({ data }) => setCategories(data || []));
  }, []);
  return (
    <select style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e5e7eb', backgroundColor: '#ffffff', color: '#111827', fontSize: '0.875rem', outline: 'none' }} value={value || ""} onChange={(e) => onChange(e.target.value)}>
      <option value="">Selecione uma Categoria...</option>
      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
    </select>
  );
};

const CategoryToggleListField = ({ value, onChange }: any) => {
  const [categories, setCategories] = useState<any[]>([]);
  useEffect(() => {
    supabase.from('categories').select('id, name').then(({ data }) => { if (data) setCategories(data); });
  }, []);

  const toggleCategory = (id: string, name: string, isChecked: boolean) => {
    let current = value ? [...value] : [];
    if (isChecked) {
      if (!current.find((c: any) => c.id === id)) current.push({ id, name });
    } else {
      current = current.filter((c: any) => c.id !== id);
    }
    onChange(current);
  };

  return (
    <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '0.5rem', backgroundColor: '#fff' }}>
      {categories.length === 0 && <span style={{ fontSize: '12px', color: '#9ca3af' }}>Carregando...</span>}
      {categories.map(c => {
        const isChecked = value ? !!value.find((v: any) => v.id === c.id) : false;
        return (
          <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', marginBottom: '8px', cursor: 'pointer' }}>
            <input type="checkbox" checked={isChecked} onChange={(e) => toggleCategory(c.id, c.name, e.target.checked)} />
            {c.name}
          </label>
        );
      })}
    </div>
  );
};

// --- TIPAGEM DOS BLOCOS ---
type Props = {
  "🎠 Banner Principal": { height: "h-[30vh]" | "h-[50vh]" | "h-[70vh]" | "h-screen"; slides: Array<{ imageUrl: string; title: string; subtitle: string; ctaText: string; ctaLink: string; }> };
  "🛍️ Carrossel de Produtos": { title: string; autoPlay: boolean; bgColor: "bg-white" | "bg-gray-50" | "bg-black"; paddingY: "py-16" | "py-24" | "py-32"; products: Array<{ productId: string }>; };
  "🏷️ Carrossel de Categorias": { title: string; autoPlay: boolean; bgColor: "bg-white" | "bg-gray-50" | "bg-black"; paddingY: "py-16" | "py-24" | "py-32"; categories: Array<{ categoryId: string }>; };
  "🏢 Marcas Parceiras": { bgColor: "bg-white" | "bg-gray-50" | "bg-black"; paddingY: "py-12" | "py-24" | "py-32"; items: Array<{ imageUrl: string }>; };

  "➗ Colunas": { distribution: "1" | "2" | "3" | "4"; gap: string; paddingY: "py-0" | "py-8" | "py-16" | "py-24" };
  "🌗 Lado a Lado": { title: string; description: string; imageSide: "left" | "right"; imageUrl: string; imageRounded: "rounded-none" | "rounded-xl" | "rounded-3xl" | "rounded-full"; blockRounded: "rounded-none" | "rounded-3xl" | "rounded-[3rem]"; ctaText?: string; ctaLink?: string; bgColor: "bg-white" | "bg-gray-50" | "bg-black"; paddingY: "py-16" | "py-24" | "py-32" };
  "📢 Chamada de Ação": { title: string; description: string; ctaText: string; ctaLink: string; bgColor: "bg-white" | "bg-gray-50" | "bg-black"; paddingY: "py-12" | "py-24" | "py-32" };
  "✉️ Newsletter": { title: string; subtitle: string; buttonText: string; bgColor: "bg-white" | "bg-gray-50" | "bg-black"; paddingY: "py-12" | "py-24" | "py-32" };

  "✍️ Texto": { text: string; tag: "h1" | "h2" | "h3" | "p"; size: "text-xs" | "text-sm" | "text-base" | "text-lg" | "text-2xl" | "text-4xl" | "text-6xl" | "text-8xl"; align: "text-left" | "text-center" | "text-right"; weight: "font-normal" | "font-medium" | "font-bold" | "font-black"; italic: boolean; uppercase: boolean; bgColor: "bg-transparent" | "bg-white" | "bg-gray-50" | "bg-black"; paddingY: "py-4" | "py-8" | "py-16" };
  "⏳ Linha do Tempo": { title: string; bgColor: "bg-white" | "bg-gray-50" | "bg-black"; paddingY: "py-16" | "py-24" | "py-32"; milestones: Array<{ year: string; title: string; description: string; imageUrl?: string; }>; };
  "🔢 Estatísticas": { bgColor: "bg-white" | "bg-gray-50" | "bg-black"; paddingY: "py-16" | "py-24" | "py-32"; items: Array<{ number: string; label: string; }>; };
  "💬 Depoimentos": { title: string; bgColor: "bg-white" | "bg-gray-50" | "bg-black"; paddingY: "py-16" | "py-24" | "py-32"; items: Array<{ name: string; company: string; quote: string; avatarUrl: string; }>; };
  "📰 Últimos Artigos": { title: string; actionText: string; actionLink: string; bgColor: "bg-white" | "bg-gray-50" | "bg-black"; paddingY: "py-16" | "py-24" | "py-32"; articles: Array<{ title: string; category: string; date: string; imageUrl: string; link: string; }>; };

  "🖼️ Mídia Avançada": { type: "image" | "video"; url: string; aspectRatio: "aspect-square" | "aspect-video" | "aspect-auto"; rounded: "rounded-none" | "rounded-xl" | "rounded-3xl" | "rounded-full"; shadow: "shadow-none" | "shadow-md" | "shadow-2xl"; grayscale: boolean; padding: "py-0" | "py-6" | "py-12" };

  "🛒 Página de Vendas": { productId: string; showSpecsTabs: boolean; };
  "📦 Card Único": { productId: string; paddingY: "py-0" | "py-8" | "py-16" }; 
  "🗂️ Abas de Produtos": { title: string; bgColor: "bg-white" | "bg-gray-50" | "bg-black"; paddingY: "py-16" | "py-24" | "py-32"; selectedCategories: Array<{ id: string; name: string; }>; };
  "🖼️ Galeria de Produtos": { title: string; actionText: string; actionLink: string; bgColor: "bg-white" | "bg-gray-50" | "bg-black"; paddingY: "py-16" | "py-24" | "py-32"; products: Array<{ productId: string; }>; };
};

// --- COMPONENTES VISUAIS (ESTILO GLOBAL MINIMALISTA) ---

function HeroSlider({ slides, height }: any) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (!slides || slides.length <= 1) return;
    const timer = setInterval(() => setCurrent((prev) => (prev + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [slides]);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  if (!slides || slides.length === 0) return <div className={`${height} bg-black flex items-center justify-center text-white font-bold`}>Adicione slides ao Banner Principal</div>;

  return (
    <div className={`relative w-full ${height} min-h-[300px] flex items-center justify-center overflow-hidden bg-black group`}>
      {slides.map((slide: any, idx: number) => (
        <div key={idx} className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
          <img src={slide.imageUrl || "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600"} className="absolute inset-0 w-full h-full object-cover" alt="Banner" />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-4 md:space-y-6 max-w-5xl mx-auto px-6">
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-black italic uppercase tracking-tighter text-white drop-shadow-lg">{slide.title}</h1>
            <p className="text-sm md:text-xl text-gray-200 font-medium tracking-wide drop-shadow-md whitespace-pre-line">{slide.subtitle}</p>
            {slide.ctaText && <div className="pt-2 md:pt-4"><a href={slide.ctaLink} className="inline-block bg-white text-black px-8 py-4 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] rounded-xl hover:bg-gray-200 transition-all active:scale-95 shadow-2xl">{slide.ctaText}</a></div>}
          </div>
        </div>
      ))}
      {slides.length > 1 && (
        <>
          <button onClick={prevSlide} className="absolute left-4 md:left-10 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 bg-white/10 hover:bg-white/30 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all"><ChevronLeftIcon className="h-5 w-5 md:h-6 md:w-6" /></button>
          <button onClick={nextSlide} className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 bg-white/10 hover:bg-white/30 text-white rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all"><ChevronRightIcon className="h-5 w-5 md:h-6 md:w-6" /></button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-3">
            {slides.map((_: any, idx: number) => <button key={idx} onClick={() => setCurrent(idx)} className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all ${idx === current ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'}`} />)}
          </div>
        </>
      )}
    </div>
  );
}

function ProductGalleryCard({ productId, isDarkTheme = false }: { productId: string, isDarkTheme?: boolean }) {
  const [product, setProduct] = useState<any>(null);
  const [categoryName, setCategoryName] = useState<string>('');
  
  useEffect(() => {
    if (!productId) return;
    supabase.from('products').select('*').eq('id', productId).single().then(({ data: prod }) => {
      if (prod) {
        setProduct(prod);
        if (prod.category_id) {
          supabase.from('categories').select('name').eq('id', prod.category_id).single().then(({ data: cat }) => setCategoryName(cat?.name || ''));
        }
      }
    });
  }, [productId]);

  if (!product) return <div className="aspect-square w-full bg-gray-50 animate-pulse rounded-2xl border border-gray-100" />;

  const textPrimary = isDarkTheme ? "text-white" : "text-gray-900";
  const textSecondary = isDarkTheme ? "text-gray-400" : "text-gray-500";
  const bgCard = isDarkTheme ? "bg-neutral-900 border-neutral-800" : "bg-gray-50 border-gray-100";
  const bgPrice = isDarkTheme ? "bg-neutral-800" : "bg-gray-50";

  return (
    <a href={`/product/${product.id}`} className="group relative flex flex-col w-full h-full cursor-pointer select-none">
      {/* 🚀 Ajustado para aspect-square e object-cover (Cópia exata da Casa das Resistências) */}
      <div className={`aspect-square w-full overflow-hidden rounded-2xl ${bgCard} pointer-events-none relative mb-4 shadow-sm`}>
        <img alt={product.name} className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700" src={product.image_url} draggable="false" />
      </div>
      <div className="flex justify-between items-start pointer-events-none px-1">
        <div className="space-y-1">
          <h3 className={`text-xs font-black uppercase tracking-tight group-hover:opacity-70 transition-colors line-clamp-2 ${textPrimary}`}>{product.name}</h3>
          <p className={`text-[9px] font-bold uppercase tracking-widest ${textSecondary}`}>{categoryName || "Catálogo"}</p>
        </div>
        <p className={`text-xs font-black italic px-2 py-1 rounded shrink-0 ml-4 ${textPrimary} ${bgPrice}`}>R$ {product.price?.toFixed(2)}</p>
      </div>
    </a>
  );
}

function RealTimeCategoryCard({ categoryId, isDarkTheme = false }: { categoryId: string, isDarkTheme?: boolean }) {
  const [category, setCategory] = useState<any>(null);
  useEffect(() => {
    if (!categoryId) return;
    supabase.from("categories").select("*").eq("id", categoryId).single().then(({ data }) => setCategory(data));
  }, [categoryId]);

  if (!category) return <div className="aspect-[4/3] w-full bg-gray-50 animate-pulse rounded-2xl border border-gray-100" />;

  const textPrimary = isDarkTheme ? "text-white" : "text-gray-900";
  const bgCard = isDarkTheme ? "bg-neutral-900 border-neutral-800" : "bg-gray-50 border-gray-100";

  return (
    <a href={`/category/${encodeURIComponent(category.name)}`} className="group flex flex-col w-full h-full select-none cursor-pointer">
      <div className={`aspect-[4/3] w-full overflow-hidden rounded-2xl ${bgCard} mb-4 pointer-events-none relative shadow-sm`}>
        <img src={category.image_url || "https://images.unsplash.com/photo-1618453292459-53424b6ebd3a?w=600"} alt={category.name} className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" draggable="false" />
      </div>
      <div className="pointer-events-none text-center">
        <h3 className={`text-sm font-black italic tracking-tighter uppercase group-hover:opacity-70 transition-colors ${textPrimary}`}>{category.name}_</h3>
      </div>
    </a>
  );
}

// --- CONFIGURAÇÃO PUCK COMPLETA E REFINADA ---
export const config: Config<Props> = {
  root: { render: ({ children }) => <div className="w-full bg-white min-h-screen overflow-x-hidden">{children}</div> },
  categories: {
    "DESTAQUES 🌟": { components: ["🎠 Banner Principal", "🛍️ Carrossel de Produtos", "🏷️ Carrossel de Categorias", "🏢 Marcas Parceiras"] },
    "ESTRUTURA 🧱": { components: ["➗ Colunas", "🌗 Lado a Lado", "📢 Chamada de Ação", "✉️ Newsletter"] },
    "CONTEÚDO 📝": { components: ["✍️ Texto", "⏳ Linha do Tempo", "🔢 Estatísticas", "💬 Depoimentos", "📰 Últimos Artigos"] },
    "MÍDIA 🎬": { components: ["🖼️ Mídia Avançada"] },
    "E-COMMERCE 🛍️": { components: ["🛒 Página de Vendas", "📦 Card Único", "🗂️ Abas de Produtos", "🖼️ Galeria de Produtos"] }
  },
  components: {
    
    // ==========================================
    // DESTAQUES 🌟
    // ==========================================
    "🎠 Banner Principal": {
      fields: {
        height: { type: "select", options: [{ label: "Tela Cheia", value: "h-screen" }, { label: "Grande", value: "h-[70vh]" }, { label: "Médio", value: "h-[50vh]" }, { label: "Pequeno", value: "h-[30vh]" }] },
        slides: {
          type: "array", label: "Slides do Banner",
          getItemSummary: (item) => item.title || "Novo Slide",
          arrayFields: { imageUrl: { type: "text", label: "URL da Imagem" }, title: { type: "text", label: "Título" }, subtitle: { type: "textarea", label: "Subtítulo" }, ctaText: { type: "text", label: "Texto do Botão" }, ctaLink: { type: "text", label: "Link do Botão" } }
        }
      },
      defaultProps: { height: "h-[70vh]", slides: [{ imageUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600", title: "STUDIO_ COLLECTION", subtitle: "O fim do excesso.", ctaText: "SHOP NOW_", ctaLink: "/shop" }] },
      render: (props) => <HeroSlider {...props} />
    },

    "🛍️ Carrossel de Produtos": {
      fields: {
        title: { type: "text" }, autoPlay: { type: "radio", options: [{label: "Sim", value: true}, {label: "Não", value: false}] },
        bgColor: { type: "select", options: [{ label: "Branco", value: "bg-white" }, { label: "Cinza", value: "bg-gray-50" }, { label: "Preto", value: "bg-black" }] },
        paddingY: { type: "select", options: [{ label: "Normal", value: "py-16" }, { label: "Grande", value: "py-24" }, { label: "Gigante", value: "py-32" }] },
        products: {
          type: "array",
          getItemSummary: (item) => { const names = useNamesMap('products'); return names[item.productId] || "Item Selecionado"; },
          arrayFields: { productId: { type: "custom", render: (p) => <ProductSelectorField {...p} /> } }
        }
      },
      defaultProps: { title: "Destaques_", autoPlay: true, bgColor: "bg-white", paddingY: "py-16", products: [] },
      render: ({ title, autoPlay, bgColor, paddingY, products }) => {
        const sliderRef = useRef<HTMLDivElement>(null);
        const [isDown, setIsDown] = useState(false);
        const [startX, setStartX] = useState(0);
        const [scrollLeft, setScrollLeft] = useState(0);
        const isDark = bgColor === 'bg-black';

        const scroll = (offsetMultiplier: number) => {
          if (sliderRef.current) {
            const cardElement = sliderRef.current.children[0] as HTMLElement;
            const cardWidth = cardElement ? cardElement.offsetWidth : 280;
            sliderRef.current.scrollBy({ left: (cardWidth + 24) * offsetMultiplier, behavior: 'smooth' });
          }
        };

        return (
          <div className={`w-full ${bgColor} ${paddingY}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between border-b border-gray-100/20 pb-6 mb-10">
                <h2 className={`text-3xl font-black italic uppercase tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
                <div className="flex gap-2">
                  <button onClick={() => scroll(-1)} className={`p-2 rounded-full transition-colors ${isDark ? 'border border-gray-700 text-white hover:bg-gray-800' : 'border border-gray-200 hover:bg-gray-50'}`}><ChevronLeftIcon className="h-5 w-5" /></button>
                  <button onClick={() => scroll(1)} className={`p-2 rounded-full transition-colors ${isDark ? 'border border-gray-700 text-white hover:bg-gray-800' : 'border border-gray-200 hover:bg-gray-50'}`}><ChevronRightIcon className="h-5 w-5" /></button>
                </div>
              </div>
              <div ref={sliderRef} onMouseDown={(e) => { setIsDown(true); setStartX(e.pageX - sliderRef.current!.offsetLeft); setScrollLeft(sliderRef.current!.scrollLeft); }} onMouseLeave={() => setIsDown(false)} onMouseUp={() => setIsDown(false)} onMouseMove={(e) => { if (!isDown) return; e.preventDefault(); sliderRef.current!.scrollLeft = scrollLeft - ((e.pageX - sliderRef.current!.offsetLeft) - startX) * 2; }} className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide cursor-grab active:cursor-grabbing">
                {products.length === 0 && <div className="w-full text-center text-gray-400 text-xs py-10 font-bold uppercase tracking-widest border border-dashed rounded-2xl">Adicione produtos</div>}
                {products.map((p, idx) => (
                  <div key={idx} className="w-[80vw] sm:w-[280px] lg:w-[calc(25%-18px)] flex-none snap-start pointer-events-auto">
                    <ProductGalleryCard productId={p.productId} isDarkTheme={isDark} />
                  </div>
                ))}
              </div>
            </div>
            <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
          </div>
        );
      }
    },

    "🏷️ Carrossel de Categorias": {
      fields: {
        title: { type: "text" }, autoPlay: { type: "radio", options: [{label: "Sim", value: true}, {label: "Não", value: false}] },
        bgColor: { type: "select", options: [{ label: "Branco", value: "bg-white" }, { label: "Cinza", value: "bg-gray-50" }, { label: "Preto", value: "bg-black" }] },
        paddingY: { type: "select", options: [{ label: "Normal", value: "py-16" }, { label: "Grande", value: "py-24" }, { label: "Gigante", value: "py-32" }] },
        categories: {
          type: "array",
          getItemSummary: (item) => { const names = useNamesMap('categories'); return names[item.categoryId] || "Categoria"; },
          arrayFields: { categoryId: { type: "custom", render: (p) => <CategorySelectorField {...p} /> } }
        }
      },
      defaultProps: { title: "Categorias_", autoPlay: true, bgColor: "bg-white", paddingY: "py-16", categories: [] },
      render: ({ title, bgColor, paddingY, categories }) => {
        const sliderRef = useRef<HTMLDivElement>(null);
        const isDark = bgColor === 'bg-black';
        const scroll = (multiplier: number) => {
          if (sliderRef.current) {
            const cardWidth = (sliderRef.current.children[0] as HTMLElement)?.offsetWidth || 250;
            sliderRef.current.scrollBy({ left: (cardWidth + 24) * multiplier, behavior: 'smooth' });
          }
        };
        return (
          <div className={`w-full ${bgColor} ${paddingY}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between border-b border-gray-100/20 pb-6 mb-10">
                <h2 className={`text-3xl font-black italic uppercase tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
                <div className="flex gap-2">
                  <button onClick={() => scroll(-1)} className={`p-2 rounded-full transition-colors ${isDark ? 'border border-gray-700 text-white hover:bg-gray-800' : 'border border-gray-200 hover:bg-gray-50'}`}><ChevronLeftIcon className="h-5 w-5" /></button>
                  <button onClick={() => scroll(1)} className={`p-2 rounded-full transition-colors ${isDark ? 'border border-gray-700 text-white hover:bg-gray-800' : 'border border-gray-200 hover:bg-gray-50'}`}><ChevronRightIcon className="h-5 w-5" /></button>
                </div>
              </div>
              <div ref={sliderRef} className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                {categories.map((c, idx) => (
                  <div key={idx} className="w-[60vw] sm:w-[220px] lg:w-[calc(20%-19.2px)] flex-none snap-start pointer-events-auto">
                    <RealTimeCategoryCard categoryId={c.categoryId} isDarkTheme={isDark} />
                  </div>
                ))}
              </div>
            </div>
            <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
          </div>
        );
      }
    },

    "🏢 Marcas Parceiras": {
      fields: { 
        bgColor: { type: "select", options: [{ label: "Branco", value: "bg-white" }, { label: "Cinza", value: "bg-gray-50" }, { label: "Preto", value: "bg-black" }] }, 
        paddingY: { type: "select", options: [{ label: "Pequeno", value: "py-12" }, { label: "Grande", value: "py-24" }, { label: "Gigante", value: "py-32" }] },
        items: { type: "array", getItemSummary: () => "Logo", arrayFields: { imageUrl: { type: "text", label: "URL da Imagem" } } } 
      },
      defaultProps: { bgColor: "bg-white", paddingY: "py-12", items: [] },
      render: ({ items, bgColor, paddingY }) => {
        const repetidos = [...items, ...items, ...items, ...items, ...items, ...items, ...items, ...items];
        return (
          <div className={`w-full ${bgColor} ${paddingY} border-y border-gray-100/10 overflow-hidden relative`}>
            <div className="flex animate-marquee whitespace-nowrap gap-16 items-center max-w-7xl mx-auto">
              {repetidos.map((item, idx) => <img key={idx} src={item.imageUrl || "https://images.unsplash.com/photo-1618453292459-53424b6ebd3a?w=200"} className="h-8 md:h-10 w-auto grayscale opacity-40 hover:opacity-100 transition-all" alt="Logo" />)}
            </div>
            <style>{` @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } .animate-marquee { animation: marquee 60s linear infinite; display: flex; width: max-content; } `}</style>
          </div>
        )
      }
    },

    // ==========================================
    // ESTRUTURA 🧱
    // ==========================================
    "➗ Colunas": {
      fields: {
        distribution: { type: "select", options: [{ label: "1 Coluna", value: "1" }, { label: "2 Colunas", value: "2" }, { label: "3 Colunas", value: "3" }, { label: "4 Colunas", value: "4" }] },
        gap: { type: "text", label: "Espaçamento Entre (ex: 2rem)" },
        paddingY: { type: "select", options: [{ label: "Nenhum", value: "py-0" }, { label: "Pequeno", value: "py-8" }, { label: "Médio", value: "py-16" }, { label: "Grande", value: "py-24" }] }
      },
      defaultProps: { distribution: "2", gap: "2rem", paddingY: "py-8" },
      render: ({ distribution, gap, paddingY }) => {
        const gridClasses = { "1": "grid-cols-1", "2": "grid-cols-1 md:grid-cols-2", "3": "grid-cols-1 md:grid-cols-3", "4": "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" }[distribution] || "grid-cols-1";
        return (
          <div className={`w-full ${paddingY} max-w-7xl mx-auto px-4`}>
            <div className={`grid w-full ${gridClasses}`} style={{ gap: gap }}>
              {Array.from({ length: parseInt(distribution) }).map((_, i) => (
                <div key={i} className="flex flex-col min-h-[150px] w-full border-2 border-transparent hover:border-gray-100 border-dashed rounded-lg transition-all"><DropZone zone={`column-${i}`} /></div>
              ))}
            </div>
          </div>
        );
      }
    },

    "🌗 Lado a Lado": {
      fields: {
        title: { type: "text" }, description: { type: "textarea" }, imageUrl: { type: "text" },
        imageSide: { type: "select", options: [{ label: "Direita", value: "right" }, { label: "Esquerda", value: "left" }] },
        imageRounded: { type: "select", options: [{ label: "Quadrado", value: "rounded-none" }, { label: "Suave", value: "rounded-xl" }, { label: "Orgânico", value: "rounded-3xl" }] },
        blockRounded: { type: "select", options: [{ label: "Quadrado", value: "rounded-none" }, { label: "Arredondado", value: "rounded-3xl" }] },
        ctaText: { type: "text" }, ctaLink: { type: "text" },
        bgColor: { type: "select", options: [{ label: "Branco", value: "bg-white" }, { label: "Cinza", value: "bg-gray-50" }, { label: "Preto", value: "bg-black" }] },
        paddingY: { type: "select", options: [{ label: "Normal", value: "py-16" }, { label: "Grande", value: "py-24" }, { label: "Gigante", value: "py-32" }] }
      },
      defaultProps: { title: "A HISTÓRIA_", description: "...", imageUrl: "", imageSide: "right", imageRounded: "rounded-none", blockRounded: "rounded-none", bgColor: "bg-white", paddingY: "py-16" },
      render: ({ title, description, imageUrl, imageSide, imageRounded, blockRounded, ctaText, ctaLink, bgColor, paddingY }) => {
        const isDark = bgColor === 'bg-black';
        const textC = isDark ? "text-white" : "text-gray-900";
        const pC = isDark ? "text-gray-300" : "text-gray-600";
        return (
          <div className={`w-full ${paddingY} px-8 ${blockRounded} overflow-hidden ${bgColor}`}>
            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
              <div className={`aspect-square overflow-hidden border border-gray-100/20 ${imageRounded} ${imageSide === "right" ? "lg:order-last" : ""}`}>
                <img src={imageUrl || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200"} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" />
              </div>
              <div className="space-y-6">
                <h2 className={`text-4xl lg:text-5xl font-black italic uppercase tracking-tighter ${textC}`}>{title}</h2>
                <p className={`text-base font-medium leading-relaxed whitespace-pre-line ${pC}`}>{description}</p>
                {ctaText && <div className="pt-4"><a href={ctaLink} className={`inline-block text-center rounded-xl px-8 py-4 text-[10px] font-black uppercase tracking-[0.25em] transition-all border border-gray-200/20 ${isDark ? 'bg-white text-black' : 'bg-gray-900 text-white'}`}>{ctaText}</a></div>}
              </div>
            </div>
          </div>
        );
      }
    },

    "📢 Chamada de Ação": {
      fields: {
        title: { type: "text", label: "Título" }, description: { type: "textarea", label: "Texto" },
        ctaText: { type: "text", label: "Botão" }, ctaLink: { type: "text", label: "Link do Botão" },
        bgColor: { type: "select", options: [{ label: "Branco", value: "bg-white" }, { label: "Cinza", value: "bg-gray-50" }, { label: "Preto", value: "bg-black" }] },
        paddingY: { type: "select", options: [{ label: "Normal", value: "py-12" }, { label: "Grande", value: "py-24" }, { label: "Gigante", value: "py-32" }] }
      },
      defaultProps: { title: "Acesse outras linhas", description: "Encontre os produtos separados por processos.", ctaText: "Saiba mais", ctaLink: "#", bgColor: "bg-gray-50", paddingY: "py-12" },
      render: ({ title, description, ctaText, ctaLink, bgColor, paddingY }) => {
        const isDark = bgColor === 'bg-black';
        return (
          <div className={`w-full ${bgColor} ${paddingY} px-4 border-y border-gray-100/10`}>
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <h3 className={`text-3xl font-black italic tracking-tighter uppercase ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
              <p className={`text-base font-medium leading-relaxed whitespace-pre-line ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{description}</p>
              {ctaText && <div className="pt-6"><a href={ctaLink} className={`inline-block rounded-xl px-8 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-white border border-gray-200 text-gray-900 hover:bg-gray-50'}`}>{ctaText}</a></div>}
            </div>
          </div>
        )
      }
    },

    "✉️ Newsletter": {
      fields: { title: { type: "text" }, subtitle: { type: "text" }, buttonText: { type: "text" }, bgColor: { type: "select", options: [{ label: "Branco", value: "bg-white" }, { label: "Cinza", value: "bg-gray-50" }, { label: "Preto", value: "bg-black" }] }, paddingY: { type: "select", options: [{ label: "Normal", value: "py-12" }, { label: "Grande", value: "py-24" }, { label: "Gigante", value: "py-32" }] } },
      defaultProps: { title: "Receba nossas novidades", subtitle: "...assine nossa newsletter", buttonText: "Inscrever", bgColor: "bg-black", paddingY: "py-12" },
      render: ({ title, subtitle, buttonText, bgColor, paddingY }) => {
        const isDark = bgColor === 'bg-black';
        return (
          <div className={`w-full ${bgColor} ${paddingY} px-6 border-y border-gray-100/10`}>
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-center">
              <div className={`${isDark ? 'text-white' : 'text-gray-900'} space-y-1`}>
                <h4 className="text-2xl font-black italic tracking-tighter uppercase">{title}</h4>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{subtitle}</p>
              </div>
              <div className="flex gap-4">
                <input type="email" placeholder="Digite seu e-mail" className="w-full bg-white border border-gray-200 text-gray-900 px-6 py-4 rounded-xl outline-none focus:ring-2 focus:ring-gray-400 font-medium text-sm" />
                <button className={`${isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-900 text-white hover:bg-gray-800'} px-8 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors`}>{buttonText}</button>
              </div>
            </div>
          </div>
        )
      }
    },

    // ==========================================
    // CONTEÚDO 📝
    // ==========================================
    "✍️ Texto": {
      fields: {
        text: { type: "textarea", label: "Conteúdo" },
        tag: { type: "select", options: [{ label: "H1", value: "h1" }, { label: "H2", value: "h2" }, { label: "H3", value: "h3" }, { label: "P", value: "p" }] },
        size: { type: "select", options: [{ label: "Micro", value: "text-xs" }, { label: "Normal", value: "text-base" }, { label: "Título", value: "text-4xl" }, { label: "Gigante", value: "text-8xl" }] },
        align: { type: "select", options: [{ label: "Esquerda", value: "text-left" }, { label: "Centro", value: "text-center" }, { label: "Direita", value: "text-right" }] },
        weight: { type: "select", options: [{ label: "Normal", value: "font-normal" }, { label: "Bold", value: "font-bold" }, { label: "Black", value: "font-black" }] },
        textColor: { type: "select", options: [{ label: "Preto", value: "text-gray-900" }, { label: "Cinza", value: "text-gray-600" }, { label: "Branco", value: "text-white" }] },
        italic: { type: "radio", options: [{ label: "Sim", value: true }, { label: "Não", value: false }] },
        uppercase: { type: "radio", options: [{ label: "Sim", value: true }, { label: "Não", value: false }] },
        bgColor: { type: "select", options: [{ label: "Transparente", value: "bg-transparent" }, { label: "Branco", value: "bg-white" }, { label: "Cinza", value: "bg-gray-50" }, { label: "Preto", value: "bg-black" }] },
        paddingY: { type: "select", options: [{ label: "Micro", value: "py-4" }, { label: "Pequeno", value: "py-8" }, { label: "Médio", value: "py-16" }] }
      },
      defaultProps: { text: "Insira seu texto...", tag: "p", size: "text-base", align: "text-left", weight: "font-normal", textColor: "text-gray-600", italic: false, uppercase: false, bgColor: "bg-transparent", paddingY: "py-4" },
      render: ({ text, tag, size, align, weight, textColor, italic, uppercase, bgColor, paddingY }) => {
        const CustomTag = tag;
        return <div className={`w-full ${bgColor} ${paddingY}`}><CustomTag className={`max-w-7xl mx-auto px-4 ${size} ${align} ${weight} ${textColor} ${italic ? 'italic' : ''} ${uppercase ? 'uppercase tracking-wider' : ''} whitespace-pre-line leading-relaxed`}>{text}</CustomTag></div>;
      }
    },

    "💬 Depoimentos": {
      fields: {
        title: { type: "text", label: "Título" }, bgColor: { type: "select", options: [{ label: "Branco", value: "bg-white" }, { label: "Cinza", value: "bg-gray-50" }, { label: "Preto", value: "bg-black" }] }, paddingY: { type: "select", options: [{ label: "Normal", value: "py-16" }, { label: "Grande", value: "py-24" }, { label: "Gigante", value: "py-32" }] },
        items: { type: "array", label: "Depoimentos", getItemSummary: (item) => item.name || "Novo Depoimento", arrayFields: { name: { type: "text", label: "Nome" }, company: { type: "text", label: "Empresa" }, quote: { type: "textarea", label: "Depoimento" }, avatarUrl: { type: "text", label: "URL da Foto" } } }
      },
      defaultProps: { title: "Depoimentos_", bgColor: "bg-gray-50", paddingY: "py-16", items: [{ name: "Mariana Valadares", company: "Indústria Vanguarda S.A.", quote: "Parceiro estratégico excelente. Estamos muito satisfeitos.", avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100" }] },
      render: ({ title, bgColor, paddingY, items }) => {
        const isDark = bgColor === 'bg-black';
        const total = items?.length || 0;
        let cols = total === 1 ? "grid-cols-1 max-w-lg" : total === 2 ? "grid-cols-1 md:grid-cols-2 max-w-5xl" : "grid-cols-1 md:grid-cols-3 max-w-7xl";
        return (
          <div className={`w-full ${paddingY} px-4 ${bgColor} border-y border-gray-100/10`}>
            <div className="max-w-7xl mx-auto">
              <h2 className={`text-3xl font-black italic uppercase tracking-tighter text-center mb-16 ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
              <div className={`grid gap-8 mx-auto w-full ${cols}`}>
                {items.map((item, idx) => (
                  <div key={idx} className={`${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-gray-100 shadow-sm hover:shadow-xl'} p-8 rounded-2xl border flex flex-col relative mt-8 transition-shadow`}>
                    <img src={item.avatarUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100"} className={`w-16 h-16 rounded-full object-cover absolute -top-8 left-8 border-4 ${isDark ? 'border-neutral-900 bg-neutral-800' : 'border-white bg-gray-100'}`} alt={item.name} />
                    <div className="mt-6 mb-4">
                      <h5 className={`font-bold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.name}</h5>
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{item.company}</p>
                    </div>
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} font-medium leading-relaxed italic text-sm`}>"{item.quote}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      }
    },

    "📰 Últimos Artigos": {
      fields: {
        title: { type: "text", label: "Título" }, actionText: { type: "text" }, actionLink: { type: "text" },
        bgColor: { type: "select", options: [{ label: "Branco", value: "bg-white" }, { label: "Cinza", value: "bg-gray-50" }, { label: "Preto", value: "bg-black" }] }, paddingY: { type: "select", options: [{ label: "Normal", value: "py-16" }, { label: "Grande", value: "py-24" }, { label: "Gigante", value: "py-32" }] },
        articles: { type: "array", label: "Artigos", getItemSummary: (item) => item.title || "Novo Artigo", arrayFields: { title: { type: "text" }, category: { type: "text" }, date: { type: "text" }, imageUrl: { type: "text" }, link: { type: "text" } } }
      },
      defaultProps: { title: "Visite nosso blog_", actionText: "Ver todos", actionLink: "/blog", bgColor: "bg-white", paddingY: "py-16", articles: [{ title: "Termoformagem de Precisão", category: "Notícias", date: "Aug 06, 2024", imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600", link: "/blog" }] },
      render: ({ title, actionText, actionLink, bgColor, paddingY, articles }) => {
        const isDark = bgColor === 'bg-black';
        return (
          <div className={`w-full ${paddingY} px-4 ${bgColor}`}>
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between border-b border-gray-100/20 pb-6 mb-10">
                <h2 className={`text-3xl font-black italic uppercase tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
                <a href={actionLink} className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900 transition-all">{actionText}</a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {articles.map((art, idx) => (
                  <a key={idx} href={art.link} className="group flex flex-col sm:flex-row gap-6 items-center">
                    <div className={`w-full sm:w-1/3 aspect-[4/3] rounded-2xl overflow-hidden ${isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-gray-50 border-gray-100'} border shrink-0`}>
                      <img src={art.imageUrl} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    <div className="space-y-3">
                      <span className={`text-[9px] font-black text-gray-400 uppercase tracking-widest border border-gray-200/20 px-2 py-1 rounded`}>{art.category}</span>
                      <h4 className={`text-lg font-bold leading-snug group-hover:opacity-70 transition-opacity line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{art.title}</h4>
                      <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">{art.date}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )
      }
    },

    "⏳ Linha do Tempo": {
      fields: { title: { type: "text" }, bgColor: { type: "select", options: [{ label: "Branco", value: "bg-white" }, { label: "Cinza", value: "bg-gray-50" }, { label: "Preto", value: "bg-black" }] }, paddingY: { type: "select", options: [{ label: "Normal", value: "py-16" }, { label: "Grande", value: "py-24" }, { label: "Gigante", value: "py-32" }] }, milestones: { type: "array", arrayFields: { year: { type: "text" }, title: { type: "text" }, description: { type: "textarea" }, imageUrl: { type: "text" } } } },
      defaultProps: { title: "NOSSOS MARCOS_", bgColor: "bg-white", paddingY: "py-16", milestones: [] },
      render: ({ title, bgColor, paddingY, milestones }) => {
        const isDark = bgColor === 'bg-black';
        return (
          <div className={`w-full ${paddingY} px-8 ${bgColor}`}>
            <div className="max-w-4xl mx-auto">
              {title && <h2 className="text-xs font-black tracking-[0.3em] text-gray-400 uppercase text-center mb-16">{title}</h2>}
              <div className="relative border-l-2 border-gray-200/20 ml-4 md:ml-32 space-y-16">
                {milestones.map((stone, idx) => (
                  <div key={idx} className="relative pl-8">
                    <div className={`absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-4 ${isDark ? 'bg-white border-black' : 'bg-black border-white'}`} />
                    <div className="md:absolute md:-left-36 md:top-0 md:w-28 md:text-right"><span className={`text-sm font-black italic px-3 py-1 rounded ${isDark ? 'bg-neutral-900 text-white' : 'bg-gray-100 text-black'}`}>{stone.year}</span></div>
                    <h3 className={`text-xl font-black uppercase ${isDark ? 'text-white' : 'text-gray-900'}`}>{stone.title}</h3>
                    <p className={`text-sm whitespace-pre-line mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{stone.description}</p>
                    {stone.imageUrl && <img src={stone.imageUrl} className="w-64 aspect-video object-cover rounded-lg shadow-md border border-gray-100/10 mt-4" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      }
    },

    "🔢 Estatísticas": {
      fields: { bgColor: { type: "select", options: [{ label: "Branco", value: "bg-white" }, { label: "Cinza", value: "bg-gray-50" }, { label: "Preto", value: "bg-black" }] }, paddingY: { type: "select", options: [{ label: "Normal", value: "py-16" }, { label: "Grande", value: "py-24" }, { label: "Gigante", value: "py-32" }] }, items: { type: "array", arrayFields: { number: { type: "text" }, label: { type: "text" } } } },
      defaultProps: { bgColor: "bg-white", paddingY: "py-16", items: [{ number: "+100", label: "EXEMPLO" }] },
      render: ({ items, bgColor, paddingY }) => {
        const isDark = bgColor === 'bg-black';
        const total = items?.length || 0;
        let cols = total === 1 ? "grid-cols-1 max-w-2xl" : total === 2 ? "grid-cols-1 sm:grid-cols-2 max-w-5xl" : "grid-cols-1 sm:grid-cols-3 max-w-7xl";
        return (
          <div className={`w-full ${paddingY} px-4 ${bgColor}`}>
            <div className={`grid gap-8 mx-auto w-full ${cols}`}>
              {items.map((item, idx) => (
                <div key={idx} className={`text-center p-12 rounded-3xl flex flex-col justify-center items-center min-h-[200px] border ${isDark ? 'bg-neutral-900 border-neutral-800 shadow-md' : 'bg-white border-gray-100 shadow-sm'}`}>
                  <p className={`text-6xl font-black italic tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.number}</p>
                  <p className="text-[10px] font-black tracking-widest text-gray-400 uppercase mt-3">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        )
      }
    },

    // ==========================================
    // MÍDIA 🎬
    // ==========================================
    "🖼️ Mídia Avançada": {
      fields: {
        type: { type: "radio", options: [{ label: "Imagem", value: "image" }, { label: "Vídeo", value: "video" }] },
        url: { type: "text", label: "URL do Arquivo" },
        padding: { type: "select", label: "Espaçamento Y", options: [{ label: "Nenhum", value: "py-0" }, { label: "Médio", value: "py-6" }, { label: "Grande", value: "py-12" }] },
        aspectRatio: { type: "select", options: [{ label: "16:9", value: "aspect-video" }, { label: "1:1", value: "aspect-square" }, { label: "Livre", value: "aspect-auto" }] },
        rounded: { type: "select", options: [{ label: "Nenhum", value: "rounded-none" }, { label: "Suave", value: "rounded-xl" }, { label: "Círculo", value: "rounded-full" }] },
        shadow: { type: "select", options: [{ label: "Nenhuma", value: "shadow-none" }, { label: "Média", value: "shadow-md" }, { label: "Forte", value: "shadow-2xl" }] },
        grayscale: { type: "radio", options: [{ label: "P&B", value: true }, { label: "Colorido", value: false }] }
      },
      defaultProps: { type: "image", url: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200", padding: "py-0", aspectRatio: "aspect-video", rounded: "rounded-xl", shadow: "shadow-none", grayscale: false },
      render: ({ type, url, padding, aspectRatio, rounded, shadow, grayscale }) => {
        const fallbackUrl = url || "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200";
        const mediaClass = `w-full h-full object-cover ${rounded} ${shadow} ${grayscale ? "grayscale hover:grayscale-0 transition-all duration-1000" : ""} bg-gray-50 border border-gray-100`;
        return (
          <div className={`w-full ${aspectRatio} relative ${padding} max-w-7xl mx-auto`}>
            {type === "image" ? (
              <img src={fallbackUrl} alt="Mídia Visual" className={mediaClass} onError={(e) => { e.currentTarget.src = fallbackUrl; }} />
            ) : (
              <div className={mediaClass}><iframe src={fallbackUrl} className="w-full h-full" allowFullScreen /></div>
            )}
          </div>
        );
      }
    },

    // ==========================================
    // E-COMMERCE 🛍️
    // ==========================================
    "🛒 Página de Vendas": {
      fields: { productId: { type: "custom", render: (p) => <ProductSelectorField {...p} /> }, showSpecsTabs: { type: "radio", options: [{ label: "Sim", value: true }, { label: "Não", value: false }] } },
      defaultProps: { productId: "", showSpecsTabs: true },
      render: ({ productId, showSpecsTabs }) => {
        const { addToCart, setIsCartOpen } = useCart();
        const [product, setProduct] = useState<any>(null);
        const [categoryName, setCategoryName] = useState<string>('');
        const [quantity, setQuantity] = useState(1);
        const [showShippingCalc, setShowShippingCalc] = useState(true);

        useEffect(() => {
          if (!productId) return;
          supabase.from('products').select('*').eq('id', productId).eq('is_active', true).single().then(({ data: prod }) => {
            if (prod) {
              setProduct(prod);
              if (prod.category_id) { supabase.from('categories').select('name').eq('id', prod.category_id).single().then(({ data: cat }) => setCategoryName(cat?.name || '')); }
            }
          });
          supabase.from('store_settings').select('value').eq('key', 'show_shipping_product_page').single().then(({ data: configData }) => {
            if (configData) setShowShippingCalc(configData.value !== 'false');
          });
        }, [productId]);

        if (!productId) return <div className="p-16 text-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 border border-dashed border-gray-200 rounded-3xl bg-gray-50/50 my-6 max-w-7xl mx-auto">Selecione um produto</div>;
        if (!product) return <div className="p-12 text-center text-xs font-bold text-gray-400 max-w-7xl mx-auto">Carregando...</div>;

        const specsTabs = product.specs_tabs || [];

        return (
          <div className="w-full bg-white text-gray-900 py-12">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-12">
                <div className="aspect-square w-full overflow-hidden rounded-2xl shadow-xl bg-gray-50 border border-gray-100 p-8">
                  <img src={product.image_url} className="h-full w-full object-contain object-center" />
                </div>
                <div className="mt-10 lg:mt-0 space-y-6">
                  <div className="space-y-2"><p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">{categoryName}_</p><h2 className="text-5xl font-black italic tracking-tighter text-gray-900 uppercase leading-none">{product.name}_</h2></div>
                  <div className="flex items-center gap-6 border-b border-gray-100 pb-6"><p className="text-4xl font-black italic tracking-tight text-gray-900">R$ {product.price?.toFixed(2)}</p></div>
                  <div className="space-y-2"><h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Descrição_</h3><p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p></div>
                  {product.stock > 0 && (
                    <div className="space-y-6 pt-4 border-t border-gray-50">
                      <button onClick={() => { addToCart(product, quantity); setIsCartOpen(true); }} className="flex w-full items-center justify-center rounded-xl bg-gray-900 px-6 py-5 text-[10px] font-black uppercase tracking-[0.4em] text-white hover:bg-gray-800 transition-all">Add to Bag_</button>
                      {showShippingCalc && <ShippingCalculator product={product} />} 
                    </div>
                  )}
                </div>
              </div>
              {showSpecsTabs && specsTabs.length > 0 && (
                <div className="mt-24 pt-16 border-t border-gray-100">
                  <TabGroup>
                    <TabList className="flex space-x-12 border-b border-gray-200 overflow-x-auto scrollbar-hide">
                      {specsTabs.map((tab: any, idx: number) => <Tab key={idx} className="whitespace-nowrap border-b-2 border-transparent py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 outline-none hover:text-gray-900 data-[selected]:border-gray-900 data-[selected]:text-gray-900 cursor-pointer transition-all">{tab.name}</Tab>)}
                    </TabList>
                    <TabPanels className="mt-12">
                      {specsTabs.map((tab: any, idx: number) => (
                        <TabPanel key={idx} className="outline-none animate-in fade-in duration-500">
                          <div className="lg:grid lg:grid-cols-2 lg:gap-x-16 items-center">
                            <div className="space-y-4"><h3 className="text-2xl font-black italic uppercase tracking-tighter text-gray-900">{tab.title || tab.name}_</h3><p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">{tab.description}</p></div>
                            {tab.image && <img src={tab.image} className="mt-10 lg:mt-0 aspect-video rounded-2xl object-cover shadow-md border border-gray-100 bg-gray-50" />}
                          </div>
                        </TabPanel>
                      ))}
                    </TabPanels>
                  </TabGroup>
                </div>
              )}
            </div>
          </div>
        );
      }
    },

    "📦 Card Único": {
      fields: {
        productId: { type: "custom", render: (p) => <ProductSelectorField {...p} /> },
        paddingY: { type: "select", options: [{ label: "Nenhum", value: "py-0" }, { label: "Pequeno", value: "py-8" }, { label: "Médio", value: "py-16" }] }
      },
      defaultProps: { productId: "", paddingY: "py-0" },
      render: ({ productId, paddingY }) => <div className={`w-full max-w-sm mx-auto ${paddingY}`}><ProductGalleryCard productId={productId} /></div>
    },

    "🖼️ Galeria de Produtos": {
      fields: {
        title: { type: "text" }, actionText: { type: "text" }, actionLink: { type: "text" },
        bgColor: { type: "select", options: [{ label: "Branco", value: "bg-white" }, { label: "Cinza", value: "bg-gray-50" }, { label: "Preto", value: "bg-black" }] }, paddingY: { type: "select", options: [{ label: "Normal", value: "py-16" }, { label: "Grande", value: "py-24" }, { label: "Gigante", value: "py-32" }] },
        products: {
          type: "array",
          getItemSummary: (item) => { const productNames = useNamesMap('products'); return productNames[item.productId] || "Item Selecionado"; },
          arrayFields: { productId: { type: "custom", render: (p) => <ProductSelectorField {...p} /> } }
        }
      },
      defaultProps: { title: "Destaques_", actionText: "Explorar Coleção", actionLink: "/shop", bgColor: "bg-white", paddingY: "py-16", products: [] },
      render: ({ title, actionText, actionLink, bgColor, paddingY, products }) => {
        const isDark = bgColor === 'bg-black';
        const total = products?.length || 0;
        let cols = total === 1 ? "grid-cols-1 max-w-sm" : total === 2 ? "grid-cols-1 sm:grid-cols-2 max-w-3xl" : "grid-cols-1 sm:grid-cols-3 lg:grid-cols-4";
        return (
          <div className={`w-full ${bgColor} ${paddingY}`}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between border-b border-gray-100/20 pb-6 mb-10">
                {title && <h2 className={`text-3xl font-black italic uppercase tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h2>}
                {actionText && <a href={actionLink} className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-gray-900 transition-all">{actionText}</a>}
              </div>
              <div className={`grid gap-x-8 gap-y-12 mx-auto w-full ${cols}`}>
                {products.map((p, idx) => <ProductGalleryCard key={idx} productId={p.productId} isDarkTheme={isDark} />)}
              </div>
            </div>
          </div>
        )
      }
    },

    "🗂️ Abas de Produtos": {
      fields: {
        title: { type: "text", label: "Título Principal" },
        bgColor: { type: "select", options: [{ label: "Branco", value: "bg-white" }, { label: "Cinza", value: "bg-gray-50" }, { label: "Preto", value: "bg-black" }] }, paddingY: { type: "select", options: [{ label: "Normal", value: "py-16" }, { label: "Grande", value: "py-24" }, { label: "Gigante", value: "py-32" }] },
        selectedCategories: { type: "custom", render: (p) => <CategoryToggleListField {...p} /> }
      },
      defaultProps: { title: "Linhas de Produtos_", bgColor: "bg-white", paddingY: "py-16", selectedCategories: [] },
      render: ({ title, bgColor, paddingY, selectedCategories }) => {
        const isDark = bgColor === 'bg-black';
        const [products, setProducts] = useState<any[]>([]);

        useEffect(() => {
          if (!selectedCategories || selectedCategories.length === 0) return;
          const ids = selectedCategories.map((c: any) => c.id);
          supabase.from('products').select('*').in('category_id', ids).eq('is_active', true).then(({ data }) => {
            if (data) setProducts(data);
          });
        }, [selectedCategories]);

        if (!selectedCategories || selectedCategories.length === 0) {
          return <div className={`w-full py-16 text-center text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-500 border-gray-800' : 'text-gray-400 border-gray-200'} border-2 border-dashed rounded-3xl m-8 max-w-7xl mx-auto`}>Selecione categorias no menu lateral para gerar as abas</div>;
        }

        return (
          <div className={`w-full ${bgColor} ${paddingY} px-4`}>
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center border-b border-gray-100/20 pb-6 mb-10">
                <h2 className={`text-3xl font-black italic uppercase tracking-tighter ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h2>
              </div>
              <TabGroup>
                <TabList className="flex flex-wrap gap-x-8 gap-y-4 mb-12 border-b border-gray-100/20 pb-4">
                  {selectedCategories.map((c: any, idx: number) => (
                    <Tab key={idx} className={`outline-none border-b-2 border-transparent pb-2 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${isDark ? 'text-gray-500 hover:text-white data-[selected]:border-white data-[selected]:text-white' : 'text-gray-400 hover:text-gray-900 data-[selected]:border-gray-900 data-[selected]:text-gray-900'}`}>
                      {c.name}
                    </Tab>
                  ))}
                </TabList>
                <TabPanels>
                  {selectedCategories.map((c: any, idx: number) => {
                    const catProducts = products.filter(p => p.category_id === c.id);
                    const total = catProducts.length;
                    let cols = total === 1 ? "grid-cols-1 max-w-sm" : total === 2 ? "grid-cols-1 sm:grid-cols-2 max-w-3xl" : "grid-cols-1 sm:grid-cols-3 lg:grid-cols-4";
                    return (
                      <TabPanel key={idx} className="outline-none animate-in fade-in duration-500">
                        <div className={`grid gap-x-8 gap-y-12 mx-auto w-full ${cols}`}>
                          {catProducts.map((p, pIdx) => <ProductGalleryCard key={pIdx} productId={p.id} isDarkTheme={isDark} />)}
                          {catProducts.length === 0 && <div className="col-span-full text-center py-12 border border-dashed border-gray-200/20 rounded-2xl text-gray-400 text-[10px] font-black uppercase tracking-widest">Nenhum produto cadastrado nesta categoria</div>}
                        </div>
                      </TabPanel>
                    )
                  })}
                </TabPanels>
              </TabGroup>
            </div>
          </div>
        )
      }
    },

    "🔠 Grade de Categorias": {
      fields: {
        categories: {
          type: "array",
          getItemSummary: (item) => { const names = useNamesMap('categories'); return names[item.categoryId] || "Categoria Selecionada"; },
          arrayFields: { categoryId: { type: "custom", render: (p) => <CategorySelectorField {...p} /> } }
        }
      },
      defaultProps: { categories: [] },
      render: ({ categories }) => {
        const total = categories?.length || 0;
        let gridCols = total === 1 ? "grid-cols-1 max-w-2xl" : total === 2 ? "grid-cols-1 sm:grid-cols-2 max-w-5xl" : total === 3 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-7xl" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl";
        return (
          <div className="w-full py-12 px-4 max-w-7xl mx-auto">
            <div className={`grid gap-6 w-full mx-auto ${gridCols}`}>
              {categories.map((cat, idx) => <RealTimeCategoryCard key={idx} categoryId={cat.categoryId} />)}
            </div>
          </div>
        );
      }
    }
  }
};