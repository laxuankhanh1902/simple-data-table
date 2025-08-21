# Kibana-Style Data Table

A complete React application featuring a sophisticated data table inspired by Kibana's interface. Built with Vite, TypeScript, and Ant Design, this application provides an interactive way to explore, filter, and visualize complex nested data structures.

![Data Table Demo](https://via.placeholder.com/800x400/1890ff/ffffff?text=Kibana-Style+Data+Table)

## 🚀 Features

### Core Functionality
- **Interactive Data Table**: Clean, modern table displaying structured data with sorting and pagination
- **Nested Data Support**: Handles complex JSON structures with deep nesting and arrays
- **Cell Hover Tooltips**: Complete data preview on hover with formatted display
- **Clickable Cells**: Click any cell to open detailed view in sliding panel

### Advanced Filtering
- **Field-based Filters**: Click any field in detail panel to add as search filter
- **Multiple Filter Types**: 
  - Exact match for strings and booleans
  - Contains/includes for text and arrays
  - Greater than/Less than for numbers
  - Range filters for numeric data
- **Filter Management**: Visual filter chips with easy removal
- **Real-time Updates**: Table updates instantly as filters are applied

### Dynamic Column Management
- **Add Columns**: Plus icon next to each field adds it as new table column
- **Nested Field Paths**: Support for complex paths like `user.profile.settings.theme`
- **Column Removal**: Remove dynamically added columns with click
- **Session Persistence**: Column configuration maintained during session

### Detail Panel
- **Sliding Right Panel**: Smooth animation when viewing record details
- **Dual View Modes**: 
  - **Human Readable**: Organized, expandable tree view of nested data
  - **Raw JSON**: Syntax-highlighted JSON with proper formatting
- **Interactive Fields**: Each field clickable for filtering and column addition

### Data Generation
- **Realistic Fake Data**: 75 records with diverse, realistic data patterns
- **Complex Data Structures**: Advanced data types including:
  - **Maps**: Key-value stores for dynamic data (address components, performance metrics, social connections)
  - **Sets**: Unique collections (wishlists, hashtags, custom field collections)
  - **Nested Arrays**: Multi-dimensional data (sessions, orders, posts, comments)
  - **Deep Objects**: Multi-level nesting (user profiles, analytics, geolocation)
  - **Mixed Collections**: Arrays containing objects with Maps and Sets
- **Real-world Scenarios**: 
  - Geolocation with coordinate Maps and nearby location arrays
  - E-commerce with order histories, product recommendations Maps, and wishlist Sets
  - Social media with connection Maps, post arrays with hashtag Sets
  - Analytics with session arrays, interaction Maps, and performance metrics
  - Custom fields with API keys, integrations, and dynamic configurations

## 🛠 Technology Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7.x for fast development and optimized builds
- **UI Library**: Ant Design 5.x for professional components
- **Styling**: Custom CSS with Ant Design theming
- **Data Utilities**: Lodash for data manipulation
- **JSON Display**: react-json-view for formatted JSON rendering
- **Type Safety**: Full TypeScript coverage with defensive programming

## 📦 Installation

```bash
# Clone or download the project
cd kibana-style-data-table

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## 🎯 Usage

### Basic Navigation
1. **View Data**: The table displays 75 records with pagination controls
2. **Click Cells**: Click any cell to open detailed view in right panel
3. **Hover for Info**: Hover over cells to see complete values in tooltips
4. **Sort & Filter**: Use table headers for sorting, pagination for navigation

### Filtering Data
1. **Open Detail Panel**: Click any cell to view record details
2. **Quick Filter**: Click any field name (blue, underlined) to instantly add a filter with that field's value
3. **Custom Filters**: Use the controls below each field to create custom filters with different operators
4. **Smart Filtering**: Automatic operator selection based on data type (equals for strings/numbers, contains for arrays/sets)
5. **Filter Management**: View active filters as blue chips above the table, remove with X button

### Adding Custom Columns
1. **Open Detail Panel**: Click any cell to access field controls
2. **Add Column**: Click the plus icon next to any field to add it as a column
3. **Remove Columns**: Green column chips above the table can be removed with X
4. **Nested Fields**: Add columns for deep nested values like `user.address.city`

### Exploring Data Structure
- **Human Readable Tab**: Organized view with collapsible sections
- **Raw JSON Tab**: Complete JSON structure with syntax highlighting
- **Nested Navigation**: Expand/collapse sections to explore data hierarchy

## 📊 Sample Data Structure

The application generates realistic data with structures like:

```json
{
  "id": "user_001",
  "timestamp": "2024-01-15T10:30:00Z",
  "status": "active",
  "priority": "high",
  "score": 847,
  "revenue": 2450.75,
  "user": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "profile": {
      "age": 32,
      "settings": {
        "theme": "dark",
        "notifications": true,
        "preferences": {
          "autoSave": true,
          "defaultView": "grid"
        }
      }
    },
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "country": "United States"
    }
  },
  "activity": {
    "type": "purchase",
    "ip": "192.168.1.100",
    "location": "New York, NY",
    "device": {
      "type": "desktop",
      "browser": "Chrome",
      "os": "macOS"
    }
  },
  "tags": ["premium", "verified", "returning"],
  "permissions": ["read", "write", "admin"],
  "metadata": {
    "source": "web",
    "campaign": "summer_sale",
    "utm": {
      "source": "google",
      "medium": "cpc",
      "campaign": "summer_sale"
    },
    "features": {
      "betaUser": false,
      "premiumTier": "pro",
      "lastLogin": "2024-01-14T22:15:00Z"
    }
  },
  "isVerified": true
}
```

## 🎨 Customization

### Styling
- Modify `src/App.css` for table-specific styles
- Update `src/index.css` for global styling
- Ant Design theme customization in `App.tsx`

### Data Generation
- Edit `src/utils/dataGenerator.ts` to modify fake data patterns
- Adjust data types and structures in `src/types.ts`
- Customize field generation logic and sample data

### UI Components
- Table configuration in `src/components/DataTable.tsx`
- Detail panel layout in `src/components/DetailPanel.tsx`
- Filter display in `src/components/FilterTags.tsx`

## 🔧 Configuration

### Development
```bash
pnpm dev          # Start development server on http://localhost:5173
pnpm type-check   # Run TypeScript type checking
pnpm lint         # Run ESLint for code quality
```

### Production
```bash
pnpm build        # Build optimized production bundle
pnpm preview      # Preview production build locally
```

### Environment Variables
No environment variables required for basic functionality.

## 📈 Performance Features

- **Virtualization**: Efficient rendering of large datasets
- **Memoization**: Optimized re-renders with React.useMemo and useCallback
- **Pagination**: Built-in pagination to handle large datasets
- **Error Boundaries**: Comprehensive error handling prevents crashes
- **Defensive Programming**: Null checks and error recovery throughout

## 🛡 Error Handling

- **React Error Boundaries**: Catches and displays component errors gracefully
- **Data Validation**: Validates data structures before rendering
- **Defensive Programming**: Null/undefined checks throughout the application
- **User Feedback**: Clear error messages and loading states
- **Graceful Degradation**: Application continues working even with partial failures

## 🤝 Contributing

This is a complete, production-ready implementation. For modifications:

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

## 📄 License

This project is open source and available under the MIT License.

## 🎉 Quick Start Guide

1. **Run the application**: `pnpm install && pnpm dev`
2. **Click a cell**: Try clicking any cell in the table
3. **Add a filter**: In the detail panel, add a filter for any field
4. **Add a column**: Click the plus icon next to a nested field
5. **Explore the data**: Switch between Human Readable and Raw JSON tabs

The application is fully functional out of the box with no additional configuration required!
