export interface ThemeColors {
  // Ana gradient renkler
  gradients: {
    primary: string[];
    secondary: string[];
    background: string[];
    categories: {
      personal: string[];
      work: string[];
      shopping: string[];
      education: string[];
      other: string[];
      default: string[];
    };
  };

  // Solid renkler
  primary: string;
  secondary: string;
  success: string;
  error: string;
  warning: string;

  // Text renkler
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    inverse: string;
  };

  // Background renkler
  background: {
    primary: string;
    secondary: string;
    card: string;
    modal: string;
  };

  // Border renkler
  border: {
    primary: string;
    secondary: string;
    focus: string;
  };
}

export const theme: ThemeColors = {
  gradients: {
    primary: ["#667eea", "#764ba2"],
    secondary: ["#3b82f6", "#2563eb"],
    background: ["#1e293b", "#475569"],
    categories: {
      personal: ["#667eea", "#764ba2"],
      work: ["#f093fb", "#f5576c"],
      shopping: ["#4facfe", "#00f2fe"],
      education: ["#43e97b", "#38f9d7"],
      other: ["#ff9a8b", "#fecfef"],
      default: ["#8b5cf6", "#a855f7"],
    },
  },

  primary: "#3b82f6",
  secondary: "#667eea",
  success: "#3b82f6",
  error: "#ef4444",
  warning: "#f59e0b",

  text: {
    primary: "#1e293b",
    secondary: "#64748b",
    disabled: "#94a3b8",
    inverse: "#ffffff",
  },

  background: {
    primary: "#ffffff",
    secondary: "#f8fafc",
    card: "rgba(255, 255, 255, 0.95)",
    modal: "rgba(0, 0, 0, 0.6)",
  },

  border: {
    primary: "#e2e8f0",
    secondary: "#cbd5e1",
    focus: "#3b82f6",
  },
};

// Kategori renk helper fonksiyonu
export const getCategoryGradient = (category: string) => {
  const normalizedCategory = category.toLowerCase();
  const categoryMap: {
    [key: string]: keyof typeof theme.gradients.categories;
  } = {
    kişisel: "personal",
    iş: "work",
    alışveriş: "shopping",
    eğitim: "education",
    diğer: "other",
  };

  const mappedCategory = categoryMap[normalizedCategory];
  return (
    theme.gradients.categories[mappedCategory] ||
    theme.gradients.categories.default
  );
};

// Öncelik renk helper fonksiyonu
export const getPriorityColor = (priority: "low" | "medium" | "high") => {
  switch (priority) {
    case "high":
      return theme.error;
    case "medium":
      return theme.warning;
    case "low":
      return theme.primary;
    default:
      return theme.text.secondary;
  }
};

// Shadow helper fonksiyonu
export const getShadowStyle = (
  color: string = "#000",
  opacity: number = 0.1
) => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: opacity,
  shadowRadius: 8,
  elevation: 4,
});

export default theme;
