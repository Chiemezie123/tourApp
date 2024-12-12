const path = require('path');

module.exports = {
  // Entry point for the application
  entry: './public/js/mapbox.js',
  
  // Output configuration
  output: {
    filename: 'bundle.js', // Output bundle name
    path: path.resolve(__dirname, 'public/js'), // Directory for the output file
    publicPath: '/js/', // Public URL path for serving the file
  },
  
  // Module rules for processing files
  module: {
    rules: [
      {
        test: /\.js$/, // Apply Babel transpiler to JS files
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/, // Process and include CSS files
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  
  // Automatically resolve these file extensions
  resolve: {
    extensions: ['.js'], // Resolve JS file extensions automatically
  },
  
  // Development or Production mode
  mode: 'development', // Switch to 'production' for optimized builds
};
