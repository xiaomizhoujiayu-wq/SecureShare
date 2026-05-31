/*
 * Copyright (C) 2026 Yumi/acdd233/puchen-star
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
export function SecureShareLogo({
  className = "w-8 h-8",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient
          id="abe-logo-gradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>

      {/* outside*/}
      <path
        d="M12 2 
            L20 6 
            V11 
            C20 16 16.5 19.5 12 22 
            C7.5 19.5 4 16 4 11 
            V6 
            Z"
        stroke="url(#abe-logo-gradient)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* attributes */}
      <circle cx="12" cy="7" r="1.5" fill="url(#abe-logo-gradient)" />
      <circle cx="7.5" cy="15" r="1.5" fill="url(#abe-logo-gradient)" />
      <circle cx="16.5" cy="15" r="1.5" fill="url(#abe-logo-gradient)" />

      {/* line */}
      <path
        d="M12 7 L12 12 M7.5 15 L12 12 M16.5 15 L12 12"
        stroke="url(#abe-logo-gradient)"
        strokeWidth="1"
        strokeDasharray="2 2"
      />

      {/* data */}
      <circle
        cx="12"
        cy="12"
        r="3"
        stroke="url(#abe-logo-gradient)"
        strokeWidth="1.5"
      />
      <circle cx="12" cy="12" r="1" fill="url(#abe-logo-gradient)" />
    </svg>
  );
}
