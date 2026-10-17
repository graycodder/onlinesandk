import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';

export const AnnouncementBar: React.FC = () => {
  const { settings } = useSettings();

  if (!settings?.announcement?.enabled || !settings?.announcement?.text) {
    return null;
  }

  const content = (
    <div className="bg-[#292522] text-[#FAF7F2] py-2 px-4 text-center text-xs tracking-wider uppercase font-medium">
      <span>{settings.announcement.text}</span>
    </div>
  );

  if (settings.announcement.link) {
    return (
      <Link to={settings.announcement.link} className="block hover:bg-black transition-colors">
        {content}
      </Link>
    );
  }

  return content;
};
