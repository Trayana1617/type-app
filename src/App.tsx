import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import {
  Search,
  ChevronLeft,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Type,
  Maximize2,
  Minimize2,
  SlidersHorizontal,
  Palette,
  Upload,
  X,
  FileUp,
  Check,
  Loader2,
  Plus,
  Italic,
} from 'lucide-react';

// --- DATASET ---
const FONTS = [
  {
    id: 'inter',
    name: 'Inter',
    foundry: 'Rasmus Andersson',
    styles: 18,
    variable: true,
    category: 'sans-serif',
    cssFamily: "'Inter', sans-serif",
    url: 'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap',
  },
  {
    id: 'playfair',
    name: 'Playfair Display',
    foundry: 'Claus Eggers Sørensen',
    styles: 14,
    variable: true,
    category: 'serif',
    cssFamily: "'Playfair Display', serif",
    url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap',
  },
  {
    id: 'space-mono',
    name: 'Space Mono',
    foundry: 'Colophon Foundry',
    styles: 4,
    variable: false,
    category: 'mono',
    cssFamily: "'Space Mono', monospace",
    url: 'https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&display=swap',
  },
  {
    id: 'georgia',
    name: 'Georgia',
    foundry: 'Matthew Carter',
    styles: 4,
    variable: false,
    category: 'serif',
    cssFamily: 'Georgia, serif',
    url: null,
  },
  {
    id: 'helvetica',
    name: 'Helvetica Neue',
    foundry: 'Max Miedinger',
    styles: 6,
    variable: false,
    category: 'sans-serif',
    cssFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    url: null,
  },
  {
    id: 'dancing-script',
    name: 'Dancing Script',
    foundry: 'Impallari Type',
    styles: 4,
    variable: true,
    category: 'script',
    cssFamily: "'Dancing Script', cursive",
    url: 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400..700&display=swap',
  },
  {
    id: 'syne',
    name: 'Syne',
    foundry: 'Bonjour Monde',
    styles: 5,
    variable: true,
    category: 'display',
    cssFamily: "'Syne', sans-serif",
    url: 'https://fonts.googleapis.com/css2?family=Syne:wght@400..800&display=swap',
  },
];

const CATEGORIES = ['All', 'sans-serif', 'serif', 'mono', 'script', 'display'];

// --- COMPONENTS ---

// 1. Reusable Slider Component for the Playground
const ControlSlider = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  unit = '',
}) => (
  <div className="flex flex-col gap-2 w-full min-w-[140px] text-left">
    <div className="flex justify-between items-center text-xs font-medium text-[#6C6C6C] uppercase tracking-wider">
      <label>{label}</label>
      <span>
        {value}
        {unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1 bg-[#E6E6E6] rounded-full appearance-none outline-none cursor-pointer accent-[#252525]"
    />
  </div>
);

// 2. Main App Component
export default function TypographyApp() {
  const [selectedFont, setSelectedFont] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('recent');
  const [customFonts, setCustomFonts] = useState([]);

  // Load external fonts dynamically
  useEffect(() => {
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.href = FONTS.filter((f) => f.url)
      .map((f) => f.url)
      .join('&')
      .replace(/&https/g, 'https');
    // Simplified single load for demo purposes (in prod, load individually or optimize)
    FONTS.forEach((font) => {
      if (font.url) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = font.url;
        document.head.appendChild(link);
      }
    });
  }, []);

  const allFonts = useMemo(() => [...FONTS, ...customFonts], [customFonts]);

  // Filter & Sort Logic
  const filteredAndSortedFonts = useMemo(() => {
    let result = allFonts.filter((font) => {
      const matchesSearch =
        font.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        font.foundry.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        activeCategory === 'All' || font.category === activeCategory;
      return matchesSearch && matchesCategory;
    });

    switch (sortBy) {
      case 'alphabetical':
        return result.sort((a, b) => a.name.localeCompare(b.name));
      case 'foundry':
        return result.sort((a, b) => a.foundry.localeCompare(b.foundry));
      case 'recent':
      default:
        return result.sort((a, b) => {
          // Custom fonts will have a createdAt timestamp. Built-ins default to 0.
          const timeA = a.createdAt || 0;
          const timeB = b.createdAt || 0;
          return timeB - timeA; // Newest first
        });
    }
  }, [allFonts, searchQuery, activeCategory, sortBy]);

  return (
    <div className="min-h-screen w-full bg-[#EFEFEF] text-[#252525] font-sans selection:bg-[#252525] selection:text-[#EFEFEF] text-left">
      {selectedFont ? (
        <PlaygroundView
          font={selectedFont}
          onBack={() => setSelectedFont(null)}
        />
      ) : (
        <IndexView
          fonts={filteredAndSortedFonts}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onSelectFont={setSelectedFont}
          onAddCustomFonts={(newFonts) =>
            setCustomFonts((prev) => [...prev, ...newFonts])
          }
        />
      )}
    </div>
  );
}

// 3. Index View (Homepage)
function IndexView({
  fonts,
  searchQuery,
  setSearchQuery,
  activeCategory,
  setActiveCategory,
  sortBy,
  setSortBy,
  onSelectFont,
  onAddCustomFonts,
}) {
  const [showUploadPanel, setShowUploadPanel] = useState(false);

  return (
    <div className="w-full mx-auto px-6 py-12 md:px-12 lg:px-16 xl:px-24 animate-in fade-in duration-500 relative">
      {/* Header & Controls */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 w-full text-left">
        <div className="flex flex-col items-start text-left shrink-0">
          <h1 className="text-3xl font-semibold tracking-tight mb-2 text-[#252525]">
            Typography
          </h1>
          <p className="text-[#6C6C6C] text-sm">
            A curated index of premium typefaces.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto shrink-0 md:justify-end">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6C6C6C]" />
            <input
              type="text"
              placeholder="Search typefaces..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#E6E6E6] text-[#252525] text-sm rounded-full py-2 pl-10 pr-4 outline-none focus:bg-white transition-all placeholder:text-[#6C6C6C] text-left"
            />
          </div>

          {/* Upload Button */}
          <button
            onClick={() => setShowUploadPanel(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#252525] text-[#EFEFEF] rounded-full text-sm font-medium hover:bg-[#252525]/80 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Typeface
          </button>
        </div>
      </header>

      {/* Filters & Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-[#E6E6E6]/50 pb-2 w-full text-left">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 sm:pb-0 w-full justify-start">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                activeCategory === category
                  ? 'bg-[#252525] text-[#EFEFEF]'
                  : 'bg-transparent text-[#6C6C6C] hover:bg-[#E6E6E6] hover:text-[#252525]'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-3 shrink-0 pb-2 sm:pb-0 justify-start sm:justify-end">
          <label className="text-xs font-medium text-[#6C6C6C] uppercase tracking-wider">
            Sort
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-[#E6E6E6] text-[#252525] text-sm rounded-lg py-1.5 px-3 outline-none focus:ring-1 ring-[#252525]/20 cursor-pointer border-none transition-colors hover:bg-[#DEDEDC] text-left"
          >
            <option value="recent">Recently Added</option>
            <option value="alphabetical">Alphabetically</option>
            <option value="foundry">Type Foundries</option>
          </select>
        </div>
      </div>

      {/* Typeface List */}
      <div className="flex flex-col gap-3 w-full">
        {fonts.length > 0 ? (
          fonts.map((font) => (
            <div
              key={font.id}
              onClick={() => onSelectFont(font)}
              className="group grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-6 bg-[#E6E6E6] hover:bg-white rounded-2xl cursor-pointer transition-colors w-full text-left"
            >
              <div className="md:col-span-4 flex flex-col items-start justify-center text-left">
                <span
                  className="text-2xl sm:text-3xl mb-1 text-[#252525]"
                  style={{ fontFamily: font.cssFamily }}
                >
                  {font.name}
                </span>
                <span className="text-xs text-[#6C6C6C] uppercase tracking-widest">
                  {font.foundry}
                </span>
              </div>

              <div
                className="md:col-span-6 flex items-center justify-start text-left text-sm text-[#6C6C6C] truncate transition-colors group-hover:text-[#6C6C6C]"
                style={{ fontFamily: font.cssFamily, fontSize: '1.25rem' }}
              >
                The quick brown fox jumps over the lazy dog.
              </div>

              <div className="md:col-span-2 flex items-center justify-start md:justify-end gap-3 text-xs text-[#6C6C6C]">
                {font.variable && (
                  <span className="px-3 py-1.5 rounded-lg bg-[#EFEFEF] group-hover:bg-[#E6E6E6] transition-colors flex items-center gap-1 font-medium whitespace-nowrap">
                    <SlidersHorizontal className="w-3 h-3" /> Variable
                  </span>
                )}
                <span className="px-3 py-1.5 rounded-lg bg-[#EFEFEF] group-hover:bg-[#E6E6E6] transition-colors font-medium whitespace-nowrap">
                  {font.styles} Styles
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="py-24 text-center text-[#6C6C6C] w-full">
            No typefaces found matching your criteria.
          </div>
        )}
      </div>

      {/* Slide-over Upload Panel */}
      {showUploadPanel && (
        <UploadPanel
          onClose={() => setShowUploadPanel(false)}
          onSave={(fonts) => {
            onAddCustomFonts(fonts);
            setShowUploadPanel(false);
          }}
        />
      )}
    </div>
  );
}

// 4. Playground View (Detail Split-screen)
function PlaygroundView({ font, onBack }) {
  // Playground State
  const [text, setText] = useState(
    'The quick brown fox jumps over the lazy dog.\n\nPack my box with five dozen liquor jugs. How vexingly quick daft zebras jump! Sphinx of black quartz, judge my vow.'
  );
  const [fontSize, setFontSize] = useState(48);
  const [fontWeight, setFontWeight] = useState(400);
  const [fontStyle, setFontStyle] = useState('normal');
  const [lineHeight, setLineHeight] = useState(1.2);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [textAlign, setTextAlign] = useState('left');
  const [textColor, setTextColor] = useState('#252525');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Reset weight & style when font changes
  useEffect(() => {
    if (font.stylesList && font.stylesList.length > 0) {
      const defaultStyle =
        font.stylesList.find((s) => s.weight === 400 && s.style === 'normal') ||
        font.stylesList[0];
      setFontWeight(defaultStyle.weight);
      setFontStyle(defaultStyle.style);
    } else {
      setFontWeight(400);
      setFontStyle('normal');
    }
  }, [font]);

  // Available specific weights for grouped custom fonts
  const availableWeights = useMemo(() => {
    if (!font.stylesList || font.variable) return null;
    return [...new Set(font.stylesList.map((s) => s.weight))].sort(
      (a, b) => a - b
    );
  }, [font]);

  // Check if current weight has an uploaded italic variant
  const hasItalicForCurrentWeight = useMemo(() => {
    if (!font.stylesList) return true; // Built-in Google Fonts
    return font.stylesList.some(
      (s) => s.weight === fontWeight && s.style === 'italic'
    );
  }, [font, fontWeight]);

  // Automatically deselect italic if user switches to a weight that lacks an italic variant
  useEffect(() => {
    if (
      font.stylesList &&
      fontStyle === 'italic' &&
      !hasItalicForCurrentWeight
    ) {
      setFontStyle('normal');
    }
  }, [fontWeight, font.stylesList, hasItalicForCurrentWeight, fontStyle]);

  return (
    <div
      className={`flex flex-col h-screen w-full text-left animate-in slide-in-from-right-8 duration-500 ease-out ${
        isFullscreen ? 'fixed inset-0 z-50 bg-[#EFEFEF]' : ''
      }`}
    >
      {/* Top Navigation Bar */}
      <div className="flex-none px-6 py-4 flex items-center justify-between border-b border-[#E6E6E6] w-full text-left">
        <button
          onClick={onBack}
          className="flex items-center justify-start gap-2 text-sm font-medium text-[#6C6C6C] hover:text-[#252525] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Index
        </button>
        <div className="flex items-center justify-end gap-4">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-full hover:bg-[#E6E6E6] transition-colors text-[#6C6C6C] hover:text-[#252525]"
            title="Toggle Fullscreen Canvas"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Split Screen Layout */}
      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden w-full text-left">
        {/* Left Panel: Information & Controls */}
        <div
          className={`flex-none w-full lg:w-80 border-r border-[#E6E6E6] bg-[#EFEFEF] overflow-y-auto flex flex-col items-start text-left ${
            isFullscreen ? 'hidden' : 'block'
          }`}
        >
          {/* Info Section */}
          <div className="p-8 border-b border-[#E6E6E6] w-full flex flex-col items-start text-left">
            <h2
              className="text-4xl font-semibold tracking-tight mb-2 leading-tight text-[#252525]"
              style={{ fontFamily: font.cssFamily }}
            >
              {font.name}
            </h2>
            <div className="text-sm text-[#6C6C6C] space-y-1 mb-6">
              <p>By {font.foundry}</p>
              <p className="uppercase tracking-widest text-xs mt-4">
                Category: {font.category}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-[#6C6C6C] w-full justify-start">
              <span className="px-3 py-1 text-xs font-medium rounded-full bg-[#E6E6E6]">
                {font.styles} Styles
              </span>
              {font.variable && (
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-[#E6E6E6] flex items-center gap-1">
                  Variable Font
                </span>
              )}
            </div>
          </div>

          {/* Controls Section */}
          <div className="p-8 flex flex-col gap-8 flex-1 w-full text-left">
            <ControlSlider
              label="Size"
              value={fontSize}
              min={12}
              max={200}
              step={1}
              unit="px"
              onChange={setFontSize}
            />

            {/* Intelligent Weight Control: Dropdown for grouped statics, Slider for Variables/Built-ins */}
            {availableWeights && !font.variable ? (
              <div className="flex flex-col gap-2 w-full text-left">
                <div className="flex justify-between items-center text-xs font-medium text-[#6C6C6C] uppercase tracking-wider">
                  <label>Weight</label>
                  <span>{fontWeight}</span>
                </div>
                <select
                  value={fontWeight}
                  onChange={(e) => setFontWeight(Number(e.target.value))}
                  className="w-full bg-[#E6E6E6] rounded-md py-2 px-3 text-[#252525] text-sm outline-none cursor-pointer focus:ring-1 ring-[#252525]/20 transition-all appearance-none border-none text-left"
                >
                  {availableWeights.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <ControlSlider
                label="Weight"
                value={fontWeight}
                min={100}
                max={900}
                step={font.variable ? 1 : 100}
                onChange={setFontWeight}
              />
            )}

            <ControlSlider
              label="Line Height"
              value={lineHeight}
              min={0.8}
              max={2.5}
              step={0.1}
              onChange={setLineHeight}
            />

            <ControlSlider
              label="Letter Spacing"
              value={letterSpacing}
              min={-0.1}
              max={0.5}
              step={0.01}
              unit="em"
              onChange={setLetterSpacing}
            />

            {/* Alignment & Colors */}
            <div className="flex flex-col gap-4 border-t border-[#E6E6E6] pt-8 w-full text-left">
              <div className="flex items-center justify-between text-xs font-medium text-[#6C6C6C] uppercase tracking-wider mb-2">
                Formatting
              </div>

              <div className="flex items-center justify-start gap-4 w-full">
                <div className="flex items-center gap-1 bg-[#E6E6E6] p-1 rounded-lg w-fit">
                  {[
                    { id: 'left', icon: AlignLeft },
                    { id: 'center', icon: AlignCenter },
                    { id: 'right', icon: AlignRight },
                    { id: 'justify', icon: AlignJustify },
                  ].map((align) => (
                    <button
                      key={align.id}
                      onClick={() => setTextAlign(align.id)}
                      className={`p-2 rounded-md transition-all ${
                        textAlign === align.id
                          ? 'bg-white shadow-sm text-[#252525]'
                          : 'text-[#6C6C6C] hover:text-[#252525]'
                      }`}
                    >
                      <align.icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>

                {/* Italic Toggle */}
                <div className="flex items-center gap-1 bg-[#E6E6E6] p-1 rounded-lg w-fit">
                  <button
                    onClick={() =>
                      setFontStyle(fontStyle === 'italic' ? 'normal' : 'italic')
                    }
                    disabled={!hasItalicForCurrentWeight}
                    title={
                      !hasItalicForCurrentWeight
                        ? 'Italic not uploaded for this weight'
                        : 'Toggle Italic'
                    }
                    className={`p-2 rounded-md transition-all ${
                      fontStyle === 'italic'
                        ? 'bg-white shadow-sm text-[#252525]'
                        : 'text-[#6C6C6C] hover:text-[#252525]'
                    } ${
                      !hasItalicForCurrentWeight
                        ? 'opacity-30 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex gap-4 mt-2 justify-start w-full">
                <div className="flex items-center gap-2">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#E6E6E6] shadow-sm">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="absolute inset-[-10px] w-12 h-12 cursor-pointer"
                    />
                  </div>
                  <span className="text-xs font-medium text-[#6C6C6C]">
                    Text
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#E6E6E6] shadow-sm">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="absolute inset-[-10px] w-12 h-12 cursor-pointer"
                    />
                  </div>
                  <span className="text-xs font-medium text-[#6C6C6C]">
                    Background
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Interactive Canvas */}
        <div
          className="flex-1 flex flex-col relative overflow-hidden transition-colors duration-300 w-full"
          style={{ backgroundColor: bgColor }}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-full resize-none outline-none p-8 md:p-16 lg:p-24 bg-transparent transition-all duration-200"
            style={{
              fontFamily: font.cssFamily,
              fontSize: `${fontSize}px`,
              fontWeight: fontWeight,
              fontStyle: fontStyle,
              lineHeight: lineHeight,
              letterSpacing: `${letterSpacing}em`,
              textAlign: textAlign,
              color: textColor,
            }}
            spellCheck="false"
          />

          {/* Subtle Indicator */}
          <div
            className="absolute bottom-6 right-6 flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-black/5 text-black/40 backdrop-blur-sm pointer-events-none"
            style={{ color: textColor, opacity: 0.5 }}
          >
            <Type className="w-3 h-3" />
            Editable Canvas
          </div>
        </div>
      </div>
    </div>
  );
}

// 5. Upload Panel (Slide-over)
function UploadPanel({ onClose, onSave }) {
  const [isDragging, setIsDragging] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [parsedFamilies, setParsedFamilies] = useState([]);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setIsDragging(false);

    // Support drop or manual file selection
    const files = Array.from(
      e.dataTransfer?.files || e.target?.files || []
    ).filter((file) => file.name.match(/\.(ttf|otf|woff|woff2)$/i));

    if (files.length === 0) return;

    setAnalyzing(true);
    let opentype;
    try {
      // Dynamically load opentype.js only when needed
      opentype = await import('https://esm.sh/opentype.js@1.3.4');
    } catch (err) {
      console.warn(
        'Could not load opentype.js, falling back to basic parsing.',
        err
      );
    }

    const familyMap = new Map();

    for (const file of files) {
      try {
        const buffer = await file.arrayBuffer();

        // Intelligent fallback: Aggressively strip weight/style modifiers from filename to force grouping
        let baseName = file.name.split('.')[0];
        baseName = baseName.replace(
          /[-_\s]?(Thin|Hairline|ExtraLight|UltraLight|Light|Regular|Medium|SemiBold|DemiBold|Bold|ExtraBold|UltraBold|Black|Heavy|Italic|Oblique).*$/i,
          ''
        );
        let familyName =
          baseName.replace(/([a-z])([A-Z])/g, '$1 $2').trim() || baseName;

        let foundry = 'Unknown Foundry';
        let isVariable = false;
        let weight = 400;
        let isItalic = false;
        let styleName = 'Regular';

        if (opentype && opentype.parse) {
          try {
            const parsed = opentype.parse(buffer);
            // CRITICAL FIX: Prioritize 'preferredFamily' (Typographic Family) over 'fontFamily'.
            // Legacy 'fontFamily' often splits "Light" or "Black" into separate families.
            familyName =
              parsed.names.wwsFamilyName?.en ||
              parsed.names.preferredFamily?.en ||
              parsed.names.fontFamily?.en ||
              familyName;

            foundry =
              parsed.names.manufacturer?.en ||
              parsed.names.designer?.en ||
              foundry;
            // Variable fonts contain a Font Variations ('fvar') table
            isVariable = !!parsed.tables.fvar;

            // Extract accurate weight and style from OS/2 tables
            const os2 = parsed.tables.os2;
            if (os2) {
              weight = os2.usWeightClass || 400;
              isItalic =
                !!(os2.fsSelection & 1) || !!(parsed.tables.head?.macStyle & 2);
            }
            styleName =
              parsed.names.fontSubfamily?.en ||
              parsed.names.preferredSubfamily?.en ||
              (isItalic
                ? weight === 400
                  ? 'Italic'
                  : `${weight} Italic`
                : weight === 400
                ? 'Regular'
                : `${weight}`);
          } catch (parseErr) {
            console.warn('opentype parse error for', file.name, parseErr);
          }
        }

        // Regex fallback if opentype fails or metadata is stripped
        if (!opentype || !opentype.parse) {
          const lowerName = file.name.toLowerCase();
          if (lowerName.includes('thin') || lowerName.includes('hairline'))
            weight = 100;
          else if (
            lowerName.includes('extralight') ||
            lowerName.includes('ultra')
          )
            weight = 200;
          else if (lowerName.includes('light')) weight = 300;
          else if (lowerName.includes('medium')) weight = 500;
          else if (lowerName.includes('semibold') || lowerName.includes('demi'))
            weight = 600;
          else if (
            lowerName.includes('extrabold') ||
            lowerName.includes('heavy')
          )
            weight = 800;
          else if (lowerName.includes('black')) weight = 900;
          else if (lowerName.includes('bold')) weight = 700;

          if (lowerName.includes('italic') || lowerName.includes('oblique'))
            isItalic = true;
          styleName = `${weight} ${isItalic ? 'Italic' : 'Regular'}`;
        }

        const cssFamily = `Custom_${familyName.replace(/[^a-zA-Z0-9]/g, '_')}`;

        // Securely load the custom font into the DOM with specific descriptors!
        // This ensures the browser groups the different files securely under the single `cssFamily`
        const fontFace = new FontFace(cssFamily, buffer, {
          weight: weight.toString(),
          style: isItalic ? 'italic' : 'normal',
        });
        await fontFace.load();
        document.fonts.add(fontFace);

        if (!familyMap.has(familyName)) {
          familyMap.set(familyName, {
            id: `custom-${cssFamily.toLowerCase()}-${Date.now()}`,
            name: familyName,
            foundry,
            styles: 0,
            variable: false, // will update below if any variant is variable
            category: 'sans-serif', // Auto-default, user can adjust
            cssFamily,
            url: null, // Indicates local file blob loading via FontFace API
            files: [],
            stylesList: [],
            createdAt: Date.now(), // Timestamp for sorting
          });
        }

        // Group font variants intelligently
        const entry = familyMap.get(familyName);
        entry.variable = entry.variable || isVariable;

        // Prevent pure duplicate variants from being added (e.g., user dropped 2 identical bold files)
        const variantExists = entry.stylesList.find(
          (s) =>
            s.weight === weight && s.style === (isItalic ? 'italic' : 'normal')
        );
        if (!variantExists) {
          entry.stylesList.push({
            weight,
            style: isItalic ? 'italic' : 'normal',
            name: styleName,
          });
          // Sort styles by weight for UI
          entry.stylesList.sort((a, b) => a.weight - b.weight);
          entry.styles = entry.stylesList.length; // Ensure main index sees total valid grouped styles
          entry.files.push(file);
        }
      } catch (err) {
        console.error('Error processing font file', file.name, err);
      }
    }

    setParsedFamilies((prev) => [...prev, ...Array.from(familyMap.values())]);
    setAnalyzing(false);
  }, []);

  const handleUpdateFamily = (index, field, value) => {
    const updated = [...parsedFamilies];
    updated[index][field] = value;
    setParsedFamilies(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end text-left">
      {/* Soft Backdrop */}
      <div
        className="absolute inset-0 bg-[#EFEFEF]/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div className="relative w-full max-w-md h-full bg-[#EFEFEF] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-6 border-b border-[#E6E6E6] text-left">
          <h2 className="text-lg font-semibold tracking-tight text-[#252525]">
            Upload Typeface
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#E6E6E6] text-[#6C6C6C] hover:text-[#252525] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 text-left">
          {/* Minimal Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-[#252525] bg-[#E6E6E6]/60'
                : 'border-[#E6E6E6] hover:border-[#6C6C6C]/30 hover:bg-[#E6E6E6]/40'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleDrop}
              multiple
              accept=".ttf,.otf,.woff,.woff2"
              className="hidden"
            />

            {analyzing ? (
              <div className="flex flex-col items-center gap-3 text-[#6C6C6C] animate-in fade-in zoom-in duration-300">
                <Loader2 className="w-6 h-6 animate-spin text-[#252525]" />
                <span className="text-sm font-medium">
                  Analyzing typography...
                </span>
              </div>
            ) : (
              <div className="animate-in fade-in zoom-in duration-300 text-[#252525]">
                <div className="w-12 h-12 rounded-full bg-[#E6E6E6] flex items-center justify-center mb-4 mx-auto text-[#6C6C6C]">
                  <FileUp className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium mb-1">
                  Drag & drop font files
                </p>
                <p className="text-xs text-[#6C6C6C]">
                  Supports .ttf, .otf, .woff, .woff2
                </p>
              </div>
            )}
          </div>

          {/* Grouped Preview Cards */}
          {parsedFamilies.length > 0 && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
              <h3 className="text-xs font-semibold text-[#6C6C6C] uppercase tracking-wider">
                Ready to Integrate
              </h3>

              {parsedFamilies.map((family, idx) => (
                <div
                  key={idx}
                  className="bg-[#E6E6E6] rounded-2xl p-6 flex flex-col gap-4 text-left"
                >
                  {/* Live Rendered Font Preview */}
                  <div
                    className="text-3xl truncate py-2 border-b border-[#EFEFEF] text-left"
                    style={{ fontFamily: family.cssFamily, color: '#252525' }}
                  >
                    {family.name || 'Preview'}
                  </div>

                  {/* Refined Metadata Editors */}
                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div className="col-span-2">
                      <label className="text-[10px] text-[#6C6C6C] uppercase tracking-widest mb-1 block">
                        Family Name
                      </label>
                      <input
                        type="text"
                        value={family.name}
                        onChange={(e) =>
                          handleUpdateFamily(idx, 'name', e.target.value)
                        }
                        className="w-full text-sm border-none bg-[#EFEFEF] text-[#252525] rounded-md px-3 py-2 outline-none focus:ring-1 ring-[#252525]/20 transition-all text-left"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] text-[#6C6C6C] uppercase tracking-widest mb-1 block">
                        Foundry
                      </label>
                      <input
                        type="text"
                        value={family.foundry}
                        onChange={(e) =>
                          handleUpdateFamily(idx, 'foundry', e.target.value)
                        }
                        className="w-full text-sm border-none bg-[#EFEFEF] text-[#252525] rounded-md px-3 py-2 outline-none focus:ring-1 ring-[#252525]/20 transition-all text-left"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#6C6C6C] uppercase tracking-widest mb-1 block">
                        Category
                      </label>
                      <select
                        value={family.category}
                        onChange={(e) =>
                          handleUpdateFamily(idx, 'category', e.target.value)
                        }
                        className="w-full text-sm border-none bg-[#EFEFEF] text-[#252525] rounded-md px-3 py-2 outline-none focus:ring-1 ring-[#252525]/20 appearance-none cursor-pointer text-left"
                      >
                        <option value="sans-serif">Sans-serif</option>
                        <option value="serif">Serif</option>
                        <option value="mono">Mono</option>
                        <option value="script">Script</option>
                        <option value="display">Display</option>
                      </select>
                    </div>
                    <div className="text-left">
                      <label className="text-[10px] text-[#6C6C6C] uppercase tracking-widest mb-1 block">
                        Auto-detected
                      </label>
                      <div className="flex flex-wrap items-center gap-1 mt-1 text-[#6C6C6C] justify-start">
                        <span className="text-[10px] font-medium px-2 py-1 bg-[#EFEFEF] rounded-md">
                          {family.styles} Styles
                        </span>
                        {family.variable && (
                          <span className="text-[10px] font-medium px-2 py-1 bg-[#252525] text-[#EFEFEF] rounded-md">
                            Variable
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Visualise the extracted grouped styles */}
                    <div className="col-span-2 mt-1 text-left">
                      <div className="flex flex-wrap gap-1.5 justify-start">
                        {family.stylesList.map((st, i) => (
                          <span
                            key={i}
                            className="text-[9px] font-medium px-1.5 py-0.5 bg-[#EFEFEF] rounded text-[#6C6C6C]"
                          >
                            {st.name} ({st.weight}
                            {st.style === 'italic' ? ' Italic' : ''})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Integration Trigger */}
        {parsedFamilies.length > 0 && (
          <div className="p-6 bg-[#EFEFEF]">
            <button
              onClick={() => onSave(parsedFamilies)}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#252525] text-[#EFEFEF] rounded-xl text-sm font-medium hover:bg-[#252525]/90 transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              <Check className="w-4 h-4" />
              Integrate {parsedFamilies.length}{' '}
              {parsedFamilies.length === 1 ? 'Typeface' : 'Typefaces'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
