import { get } from 'lodash';
import type { DataRow, Filter } from '../types';

export const getNestedValue = (obj: any, path: string): any => {
  try {
    if (!obj || !path) return undefined;
    return get(obj, path);
  } catch (error) {
    console.warn('Error getting nested value:', error, { path, obj });
    return undefined;
  }
};

export const flattenObject = (obj: any, prefix: string = ''): Record<string, any> => {
  const flattened: Record<string, any> = {};
  
  try {
    if (!obj || typeof obj !== 'object') {
      return flattened;
    }

    // Handle Map objects
    if (obj instanceof Map) {
      flattened[prefix || 'map'] = obj;
      Array.from(obj.entries()).forEach(([k, v], index) => {
        const mapKey = prefix ? `${prefix}[${k}]` : `map[${k}]`;
        if (v && typeof v === 'object' && !(v instanceof Map) && !(v instanceof Set) && !Array.isArray(v)) {
          Object.assign(flattened, flattenObject(v, mapKey));
        } else {
          flattened[mapKey] = v;
        }
      });
      return flattened;
    }

    // Handle Set objects
    if (obj instanceof Set) {
      flattened[prefix || 'set'] = obj;
      return flattened;
    }

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const newKey = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];
        
        if (value === null || value === undefined) {
          flattened[newKey] = value;
        } else if (value instanceof Map) {
          flattened[newKey] = value;
          // Flatten Map entries
          Array.from(value.entries()).forEach(([k, v]) => {
            const mapKey = `${newKey}[${k}]`;
            if (v && typeof v === 'object' && !(v instanceof Map) && !(v instanceof Set) && !Array.isArray(v)) {
              Object.assign(flattened, flattenObject(v, mapKey));
            } else {
              flattened[mapKey] = v;
            }
          });
        } else if (value instanceof Set) {
          flattened[newKey] = value;
        } else if (Array.isArray(value)) {
          flattened[newKey] = value;
          // Also flatten array items if they're objects
          value.forEach((item, index) => {
            if (item && typeof item === 'object' && !(item instanceof Map) && !(item instanceof Set)) {
              Object.assign(flattened, flattenObject(item, `${newKey}[${index}]`));
            }
          });
        } else if (typeof value === 'object') {
          try {
            Object.assign(flattened, flattenObject(value, newKey));
          } catch (nestedError) {
            console.warn('Error flattening nested object:', nestedError);
            flattened[newKey] = value;
          }
        } else {
          flattened[newKey] = value;
        }
      }
    }
  } catch (error) {
    console.error('Error flattening object:', error);
    flattened['__error__'] = 'Error processing object';
  }
  
  return flattened;
};

export const getAllFieldPaths = (data: DataRow[]): string[] => {
  const paths = new Set<string>();
  
  data.forEach(row => {
    const flattened = flattenObject(row);
    Object.keys(flattened).forEach(key => paths.add(key));
  });
  
  return Array.from(paths).sort();
};

export const formatValue = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }
  
  if (Array.isArray(value)) {
    return value.map(item => 
      typeof item === 'object' ? JSON.stringify(item) : String(item)
    ).join(', ');
  }
  
  if (value instanceof Map) {
    const entries = Array.from(value.entries()).map(([k, v]) => `${k}: ${v}`);
    return `Map(${entries.length}) {${entries.slice(0, 3).join(', ')}${entries.length > 3 ? '...' : ''}}`;
  }
  
  if (value instanceof Set) {
    const values = Array.from(value).map(v => String(v));
    return `Set(${values.length}) {${values.slice(0, 3).join(', ')}${values.length > 3 ? '...' : ''}}`;
  }
  
  if (typeof value === 'object') {
    try {
      // For complex objects, show a user-friendly preview
      const keys = Object.keys(value);
      if (keys.length === 0) return '{}';
      
      // Show key count and first few keys for preview
      if (keys.length > 3) {
        return `{${keys.slice(0, 3).join(', ')}, ...${keys.length - 3} more}`;
      } else {
        // For small objects, show abbreviated key:value pairs
        const preview = keys.slice(0, 2).map(key => {
          const val = value[key];
          const valStr = typeof val === 'object' ? '{...}' : String(val);
          return `${key}: ${valStr.length > 15 ? valStr.substring(0, 15) + '...' : valStr}`;
        }).join(', ');
        return `{${preview}${keys.length > 2 ? ', ...' : ''}}`;
      }
    } catch {
      return '[Complex Object]';
    }
  }
  
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  
  if (typeof value === 'number') {
    return value.toLocaleString();
  }
  
  return String(value);
};

export const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const applyFilters = (data: DataRow[], filters: Filter[]): DataRow[] => {
  if (!data || !Array.isArray(data)) return [];
  if (!filters || filters.length === 0) return data;
  
  try {
    return data.filter(row => {
      if (!row) return false;
      
      return filters.every(filter => {
        try {
          if (!filter || !filter.field) return true;
          
          const value = getNestedValue(row, filter.field);
          
          if (value === null || value === undefined) {
            return false;
          }
          
          switch (filter.operator) {
            case 'equals':
              if (Array.isArray(value)) {
                return value.includes(filter.value);
              }
              return String(value).toLowerCase() === String(filter.value).toLowerCase();
              
            case 'contains':
              if (Array.isArray(value)) {
                return value.some(item => 
                  String(item).toLowerCase().includes(String(filter.value).toLowerCase())
                );
              }
              return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
              
            case 'greater':
              const greaterNum = Number(value);
              const filterGreater = Number(filter.value);
              return !isNaN(greaterNum) && !isNaN(filterGreater) && greaterNum > filterGreater;
              
            case 'less':
              const lessNum = Number(value);
              const filterLess = Number(filter.value);
              return !isNaN(lessNum) && !isNaN(filterLess) && lessNum < filterLess;
              
            case 'range':
              const numValue = Number(value);
              const minValue = Number(filter.value?.min);
              const maxValue = Number(filter.value?.max);
              return !isNaN(numValue) && !isNaN(minValue) && !isNaN(maxValue) &&
                     numValue >= minValue && numValue <= maxValue;
              
            default:
              return false;
          }
        } catch (filterError) {
          console.warn('Error applying filter:', filterError, { filter, row });
          return true;
        }
      });
    });
  } catch (error) {
    console.error('Error applying filters:', error);
    return data;
  }
};

export const generateFilterLabel = (field: string, value: any, operator: string): string => {
  const fieldName = field.split('.').pop() || field;
  
  switch (operator) {
    case 'equals':
      return `${fieldName} = "${value}"`;
    case 'contains':
      return `${fieldName} contains "${value}"`;
    case 'greater':
      return `${fieldName} > ${value}`;
    case 'less':
      return `${fieldName} < ${value}`;
    case 'range':
      return `${fieldName} between ${value.min} and ${value.max}`;
    default:
      return `${fieldName} ${operator} ${value}`;
  }
};

export const parseSearchQuery = (query: string): Array<{ field?: string; operator?: string; value: string; isGlobal: boolean }> => {
  if (!query.trim()) return [];
  
  const terms: Array<{ field?: string; operator?: string; value: string; isGlobal: boolean }> = [];
  
  // Improved regex to handle field:value and field="value" patterns
  const fieldPattern = /([a-zA-Z0-9_.[\]]+)\s*([:><=]+)\s*("([^"]*)"|([^\s]+))/g;
  let match;
  let lastIndex = 0;
  
  // Find all field:value patterns
  while ((match = fieldPattern.exec(query)) !== null) {
    const [fullMatch, field, operator, , quotedValue, unquotedValue] = match;
    const value = quotedValue || unquotedValue || '';
    
    let searchOperator = 'equals';
    if (operator === ':') {
      searchOperator = 'contains';
    } else if (operator === '=') {
      searchOperator = 'equals';
    } else if (operator === '>') {
      searchOperator = 'greater';
    } else if (operator === '<') {
      searchOperator = 'less';
    } else if (operator === '>=') {
      searchOperator = 'greater';
    } else if (operator === '<=') {
      searchOperator = 'less';
    }
    
    terms.push({
      field,
      operator: searchOperator,
      value: value.trim(),
      isGlobal: false
    });
    
    lastIndex = match.index + fullMatch.length;
  }
  
  // Handle remaining text as global search terms
  const remainingText = query.substring(lastIndex).trim();
  if (remainingText) {
    const globalTerms = remainingText.match(/(?:"[^"]*"|[^\s]+)/g) || [];
    globalTerms.forEach(term => {
      const cleanTerm = term.replace(/^"(.*)"$/, '$1');
      if (cleanTerm.trim()) {
        terms.push({
          value: cleanTerm,
          isGlobal: true
        });
      }
    });
  }
  
  return terms;
};

export const applySearchQuery = (data: DataRow[], searchQuery: string): DataRow[] => {
  if (!searchQuery.trim()) return data;
  
  const searchTerms = parseSearchQuery(searchQuery);
  if (searchTerms.length === 0) return data;
  
  return data.filter(row => {
    return searchTerms.every(term => {
      if (term.isGlobal) {
        // Global search across all fields
        return searchInRecord(row, term.value.toLowerCase());
      } else if (term.field) {
        // Field-specific search
        const fieldValue = getNestedValue(row, term.field);
        return matchesFieldValue(fieldValue, term.value, term.operator || 'contains');
      }
      return false;
    });
  });
};

const searchInRecord = (record: any, searchTerm: string): boolean => {
  const searchInValue = (value: any): boolean => {
    if (value === null || value === undefined) return false;
    
    if (typeof value === 'string') {
      return value.toLowerCase().includes(searchTerm);
    }
    
    if (typeof value === 'number') {
      return value.toString().includes(searchTerm);
    }
    
    if (typeof value === 'boolean') {
      return value.toString().toLowerCase().includes(searchTerm);
    }
    
    if (value instanceof Map) {
      return Array.from(value.entries()).some(([k, v]) => 
        String(k).toLowerCase().includes(searchTerm) || searchInValue(v)
      );
    }
    
    if (value instanceof Set) {
      return Array.from(value).some(item => searchInValue(item));
    }
    
    if (Array.isArray(value)) {
      return value.some(item => searchInValue(item));
    }
    
    if (typeof value === 'object') {
      return Object.entries(value).some(([k, v]) => 
        k.toLowerCase().includes(searchTerm) || searchInValue(v)
      );
    }
    
    return false;
  };
  
  return searchInValue(record);
};

const matchesFieldValue = (fieldValue: any, searchValue: string, operator: string): boolean => {
  if (fieldValue === null || fieldValue === undefined) return false;
  
  switch (operator) {
    case 'equals':
      if (Array.isArray(fieldValue)) {
        return fieldValue.some(item => String(item).toLowerCase() === searchValue.toLowerCase());
      }
      return String(fieldValue).toLowerCase() === searchValue.toLowerCase();
      
    case 'contains':
      if (Array.isArray(fieldValue)) {
        return fieldValue.some(item => 
          String(item).toLowerCase().includes(searchValue.toLowerCase())
        );
      }
      if (fieldValue instanceof Set) {
        return Array.from(fieldValue).some(item => 
          String(item).toLowerCase().includes(searchValue.toLowerCase())
        );
      }
      return String(fieldValue).toLowerCase().includes(searchValue.toLowerCase());
      
    case 'greater':
      const numValue = Number(fieldValue);
      const searchNum = Number(searchValue);
      return !isNaN(numValue) && !isNaN(searchNum) && numValue > searchNum;
      
    case 'less':
      const numValue2 = Number(fieldValue);
      const searchNum2 = Number(searchValue);
      return !isNaN(numValue2) && !isNaN(searchNum2) && numValue2 < searchNum2;
      
    default:
      return String(fieldValue).toLowerCase().includes(searchValue.toLowerCase());
  }
};