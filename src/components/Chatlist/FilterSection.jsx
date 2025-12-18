import React from "react";
import SearchModal from "../../components/SearchModal";

const FilterSection = ({ 
  showOnlyChats, 
  usersCount, 
  onToggleFilter, 
  onSearch 
}) => (
  <div className="px-2 py-1 border-b border-gray-200">
    
    <div className="flex items-center justify-between mb-2">
    
      <h3 className="text-sm font-semibold text-gray-700">
        {showOnlyChats ? `Chats (${usersCount})` : `All Users (${usersCount})`}
      </h3>
    
      {/* <input type="text" placeholder="Search User"/> */}
      <SearchModal startChat={onSearch} />
    
    </div>
    
    <div className="flex items-center justify-between mt-2">
    
      <span className="text-xs text-gray-500">
        {showOnlyChats ? "Showing only users you've chatted with" : "Showing all registered users"}
      </span>
    
      <button 
        onClick={onToggleFilter} 
        className="text-xs bg-teal-100 hover:bg-teal-200 text-teal-700 px-3 py-1 rounded-lg transition-colors"
      >
        {showOnlyChats ? "Show All Users" : "Show Only Chats"}
      </button>
    
    </div>
  
  </div>

);

export default FilterSection;