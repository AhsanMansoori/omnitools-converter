import React from "react"
import { 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Scissors, 
  Archive, 
  FileImage, 
  FilePlus, 
  Upload, 
  Palette,
  FileX,
  Wand2,
  FileSearch,
  PlayCircle
} from "lucide-react"

export type Tool = {
  id: string; // slug
  name: string;
  description: string;
  accepts: string[]; // mime types
  multiple?: boolean;
  maxSizeMB?: number;
  category: 'PDF' | 'Image' | 'Video' | 'Other';
  route: string; // /tools/[id]
  icon?: React.ReactNode;
};

// Tool registry - single source of truth
export const tools: Tool[] = [
  {
    id: "pdf-to-word",
    name: "PDF to Word",
    description: "Convert PDF documents to editable Word files with preserved formatting",
    accepts: ["application/pdf"],
    multiple: false,
    maxSizeMB: 50,
    category: "PDF",
    route: "/tools/pdf-to-word",
    icon: React.createElement(FileText, { className: "h-5 w-5" })
  },
  {
    id: "pdf-merge",
    name: "PDF Merge", 
    description: "Combine multiple PDF files into a single document",
    accepts: ["application/pdf"],
    multiple: true,
    maxSizeMB: 25,
    category: "PDF",
    route: "/tools/pdf-merge",
    icon: React.createElement(FilePlus, { className: "h-5 w-5" })
  },
  {
    id: "pdf-split",
    name: "PDF Split",
    description: "Extract pages or split PDF into multiple files",
    accepts: ["application/pdf"],
    multiple: false,
    maxSizeMB: 50,
    category: "PDF",
    route: "/tools/pdf-split",
    icon: React.createElement(Scissors, { className: "h-5 w-5" })
  },
  {
    id: "pdf-compress",
    name: "PDF Compress",
    description: "Reduce PDF file size while maintaining quality",
    accepts: ["application/pdf"],
    multiple: false,
    maxSizeMB: 100,
    category: "PDF",
    route: "/tools/pdf-compress",
    icon: React.createElement(Archive, { className: "h-5 w-5" })
  },
  {
    id: "pdf-watermark-add",
    name: "PDF Watermark Add",
    description: "Add text or image watermarks to PDF documents",
    accepts: ["application/pdf"],
    multiple: false,
    maxSizeMB: 50,
    category: "PDF",
    route: "/tools/pdf-watermark-add",
    icon: React.createElement(Palette, { className: "h-5 w-5" })
  },
  {
    id: "image-bg-remove",
    name: "Image Background Remove",
    description: "Automatically remove backgrounds from images using AI",
    accepts: ["image/jpeg", "image/png", "image/webp"],
    multiple: false,
    maxSizeMB: 20,
    category: "Image",
    route: "/tools/image-bg-remove",
    icon: React.createElement(Wand2, { className: "h-5 w-5" })
  },
  {
    id: "image-resize",
    name: "Image Resize",
    description: "Resize images to custom dimensions or percentages",
    accepts: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp"],
    multiple: true,
    maxSizeMB: 10,
    category: "Image",
    route: "/tools/image-resize",
    icon: React.createElement(FileImage, { className: "h-5 w-5" })
  },
  {
    id: "image-convert",
    name: "Image Convert",
    description: "Convert images between different formats (JPEG, PNG, WebP)",
    accepts: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp", "image/tiff"],
    multiple: true,
    maxSizeMB: 15,
    category: "Image",
    route: "/tools/image-convert",
    icon: React.createElement(Upload, { className: "h-5 w-5" })
  },
  {
    id: "webp-to-mp4",
    name: "WebP to MP4",
    description: "Convert animated WebP images to MP4 video format",
    accepts: ["image/webp"],
    multiple: false,
    maxSizeMB: 30,
    category: "Video",
    route: "/tools/webp-to-mp4",
    icon: React.createElement(PlayCircle, { className: "h-5 w-5" })
  },
  {
    id: "ocr-pdf",
    name: "OCR PDF",
    description: "Extract text from scanned PDFs using optical character recognition",
    accepts: ["application/pdf"],
    multiple: false,
    maxSizeMB: 75,
    category: "Other",
    route: "/tools/ocr-pdf",
    icon: React.createElement(FileSearch, { className: "h-5 w-5" })
  }
];

// Category definitions
export const toolCategories = {
  PDF: {
    name: "PDF Tools",
    description: "Professional PDF processing and conversion tools",
    color: "text-red-500",
    icon: FileText,
  },
  Image: {
    name: "Image Tools", 
    description: "Advanced image processing and conversion tools",
    color: "text-blue-500",
    icon: ImageIcon,
  },
  Video: {
    name: "Video Tools",
    description: "Powerful video editing and conversion tools",
    color: "text-green-500", 
    icon: Video,
  },
  Other: {
    name: "Other Tools",
    description: "Specialized processing tools and utilities",
    color: "text-purple-500",
    icon: FileX,
  }
};

// Helper functions
export function getToolById(id: string): Tool | undefined {
  return tools.find(tool => tool.id === id);
}

export function getToolsByCategory(category: keyof typeof toolCategories): Tool[] {
  return tools.filter(tool => tool.category === category);
}

export function getAllCategories() {
  return Object.entries(toolCategories).map(([key, value]) => ({
    slug: key,
    ...value,
  }));
}

// Get accepted file extensions for a tool
export function getAcceptedExtensions(tool: Tool): string[] {
  const mimeToExt: Record<string, string[]> = {
    "application/pdf": ["pdf"],
    "image/jpeg": ["jpg", "jpeg"],
    "image/png": ["png"],
    "image/webp": ["webp"],
    "image/gif": ["gif"],
    "image/bmp": ["bmp"],
    "image/tiff": ["tiff", "tif"]
  };
  
  return tool.accepts.flatMap(mime => mimeToExt[mime] || []);
}

// Get human-readable file type names
export function getFileTypeNames(tool: Tool): string[] {
  const mimeToName: Record<string, string> = {
    "application/pdf": "PDF",
    "image/jpeg": "JPEG",
    "image/png": "PNG",
    "image/webp": "WebP",
    "image/gif": "GIF",
    "image/bmp": "BMP",
    "image/tiff": "TIFF"
  };
  
  return tool.accepts.map(mime => mimeToName[mime] || mime);
}