function parsePeriodFromHtml(htmlString) {
  // Ajusta las regex según la estructura real de tu HTML
  const startDateMatch = htmlString.match(/Inicia:\s*(\d{4}-\d{2}-\d{2})/);
  const endDateMatch = htmlString.match(/Finaliza:\s*(\d{4}-\d{2}-\d{2})/);

  if (startDateMatch && endDateMatch) {
    return `${startDateMatch[1]} / ${endDateMatch[1]}`;
  }

  return 'No data available';
}

module.exports = { parsePeriodFromHtml };
