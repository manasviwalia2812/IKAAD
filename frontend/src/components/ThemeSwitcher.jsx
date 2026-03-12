import PropTypes from "prop-types";

const THEMES = [
  { id: "neon", label: "Neon" },
  { id: "midnight", label: "Midnight" },
  { id: "paper", label: "Paper" },
];

export function ThemeSwitcher({ theme, onChange }) {
  return (
    <div className="themeSwitcher">
      <span className="themeLabel">Theme</span>
      <select
        className="select"
        value={theme}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Select theme"
      >
        {THEMES.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>
    </div>
  );
}

ThemeSwitcher.propTypes = {
  theme: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

