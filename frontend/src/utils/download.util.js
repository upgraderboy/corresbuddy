/**
 * Downloads a resource file securely via the backend /file endpoint.
 * Triggers authentic browser file download with correct filename and mime-type
 * without opening blank tabs or navigating away.
 */
export async function downloadResourceFile(resourceId, fallbackFileName = 'resource.pdf') {
  try {
    const token = localStorage.getItem('token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`/api/v1/resources/${resourceId}/file`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      // If 404 or other error, read json if possible
      let errorMsg = `Download failed (${response.status})`;
      try {
        const errJson = await response.json();
        if (errJson.error) errorMsg = errJson.error;
      } catch (e) {
        // ignore
      }
      throw new Error(errorMsg);
    }

    // Extract filename from Content-Disposition header if available
    let fileName = fallbackFileName;
    const disposition = response.headers.get('content-disposition');
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename=["']?([^"';]+)["']?/i);
      if (match && match[1]) {
        fileName = match[1].trim();
      }
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
    return true;
  } catch (error) {
    console.error('Download error:', error);
    alert(`Could not download file: ${error.message}`);
    return false;
  }
}

