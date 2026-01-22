# 📸 FILE UPLOAD API DOCUMENTATION

## Endpoint

```
POST /api/upload
```

## Authentication
Required: JWT token in `Authorization` header

```
Authorization: Bearer <JWT_TOKEN>
```

---

## Request

### Headers
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

### Body
- `image` (required): Image file
  - Accepted formats: JPEG, PNG, GIF, WebP
  - Max size: 5MB

### Using cURL
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/image.jpg" \
  http://localhost:5000/api/upload
```

### Using JavaScript/Fetch
```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]);

const response = await fetch('/api/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const data = await response.json();
if (data.success) {
  console.log('Image URL:', data.data.url);
}
```

### Using Axios
```javascript
const formData = new FormData();
formData.append('image', file);

const response = await axios.post('/api/upload', formData, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'multipart/form-data'
  }
});

console.log(response.data.data.url);
```

---

## Response

### Success (200)
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "filename": "1705932120000-123456789.jpg",
    "originalName": "my-restaurant.jpg",
    "size": 256000,
    "url": "/uploads/1705932120000-123456789.jpg"
  }
}
```

### Error Responses

#### No file uploaded (400)
```json
{
  "success": false,
  "error": "No file uploaded"
}
```

#### Invalid file type (400)
```json
{
  "success": false,
  "error": "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."
}
```

#### File too large (400)
```json
{
  "success": false,
  "error": "File too large"
}
```

#### No authentication (401)
```json
{
  "success": false,
  "error": "Access token required"
}
```

#### Invalid token (403)
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

#### Server error (500)
```json
{
  "success": false,
  "error": "Failed to upload image"
}
```

---

## Usage in Dishcovery

### 1. Upload Restaurant Image
```javascript
// Step 1: Upload image
const uploadResponse = await fetch('/api/upload', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});

const uploadData = uploadResponse.json();
const imageUrl = uploadData.data.url;

// Step 2: Create restaurant with image
const restaurantResponse = await fetch('/api/owner/restaurants', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'My Restaurant',
    cuisine: 'Italian',
    location: 'Downtown',
    description: 'Best Italian food',
    image_url: imageUrl
  })
});
```

### 2. Upload Dish Image
```javascript
// Upload dish image
const imageUrl = await uploadImage(file);

// Add dish with image
await fetch('/api/owner/restaurants/1/dishes', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Pasta Carbonara',
    price: 12.99,
    image_url: imageUrl,
    description: 'Traditional Roman pasta'
  })
});
```

### 3. Access Uploaded Image
```
<img src="http://localhost:5000/uploads/1705932120000-123456789.jpg" />
```

---

## File Naming Convention

Uploaded files are automatically renamed with the format:
```
{timestamp}-{random9digits}.{extension}
```

Example:
```
1705932120000-456789123.jpg
1705932145678-123456789.png
```

This ensures:
- No filename collisions
- Unique identification
- Easy tracking

---

## Storage Location

Uploaded files are stored in:
```
server/uploads/
```

Directory structure:
```
server/
├── uploads/
│   ├── 1705932120000-456789123.jpg
│   ├── 1705932145678-123456789.png
│   └── ...
```

---

## File Constraints

| Property | Limit |
|----------|-------|
| Max file size | 5 MB |
| Accepted formats | JPEG, PNG, GIF, WebP |
| MIME types | image/jpeg, image/png, image/gif, image/webp |
| File naming | {timestamp}-{random}.{ext} |

---

## Best Practices

1. **Always validate client-side** before uploading
2. **Use meaningful filenames** before uploading (helps for debugging)
3. **Compress images** before upload when possible
4. **Handle errors gracefully** and show user feedback
5. **Store URLs** in database after successful upload
6. **Use HTTPS** in production
7. **Implement rate limiting** for uploads (future feature)
8. **Backup uploads directory** regularly

---

## Frontend Integration with ImageUploadForm Component

```jsx
import ImageUploadForm from './components/ImageUploadForm';

function MyComponent() {
  const [imageUrl, setImageUrl] = useState(null);

  const handleImageUpload = (url) => {
    setImageUrl(url);
    console.log('Image uploaded:', url);
  };

  return (
    <div>
      <ImageUploadForm 
        onUploadSuccess={handleImageUpload}
        maxSize={5}
      />
      {imageUrl && <img src={imageUrl} alt="Uploaded" />}
    </div>
  );
}
```

---

## Troubleshooting

### Issue: CORS errors
**Solution:** Ensure CORS is enabled in server (already configured in index.js)

### Issue: Permission denied
**Solution:** Ensure uploads directory exists and is writable

### Issue: File appears invalid
**Solution:** Verify file is actual image file, not renamed document

### Issue: Upload timeout
**Solution:** Check file size and network connection

### Issue: Image not displaying
**Solution:** Verify image URL is correct and server is running
