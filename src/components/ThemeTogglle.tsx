import { useTheme } from "@/contexts/ThemeContext";
import{Sun,Moon} from "lucide-react";


const ThemeToggle = () => {
    const { toggleTheme }=useTheme();

    return(

        <button 
        aria-label='theme toggler' 
        onClick={toggleTheme}
        className="flex items-center justify-center text-black rounded-full cursor-pointer bg-gray-2 dark:bg-dark-bg h-9 w-9 dark:text-white md:h-14 md:w-14"
            >
        {/* light mode */}
        <Moon className="w-5 h-5 text-emerald-600 dark:hidden md:w-6 md:h-6" />
        {/* dark mode */}
        <Sun className="hidden w-5 h-5 dark:block md:w-6 md:h-6 text-emerald-600" />
        

        </button>
    );
};

export default ThemeToggle;