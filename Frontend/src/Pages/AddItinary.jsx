import { Alert, Button, FileInput, Select, TextInput, Badge } from "flowbite-react";
import { useEffect, useState } from "react";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { app } from "../firebase";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useNavigate } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";

export default function AddItinerary() {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  const [file, setFile] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [formData, setFormData] = useState({
    image: "",
    title: "",
    categories: [],  
    averageTime: "",
    averageCost: "",  
    location: "",
  });
  const [publishError, setPublishError] = useState(null);
  const navigate = useNavigate();

  const categoryOptions = ["Adventure", "Culture", "Nature", "Luxury", "Food", "Relaxation"];

  // Handle multiple category selection
  const handleCategoryChange = (e) => {
    const selectedCategory = e.target.value;
    if (!formData.categories.includes(selectedCategory)) {
      setFormData((prev) => ({
        ...prev,
        categories: [...prev.categories, selectedCategory],
      }));
    }
  };

  // Remove selected category
  const removeCategory = (category) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.filter((cat) => cat !== category),
    }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUploadImage = () => {
    if (!file) {
      setImageUploadError("Please select an image");
      return;
    }
    setImageUploadError(null);
  
    const storage = getStorage(app);
    const fileName = `${new Date().getTime()}-${file.name}`;
    const storageRef = ref(storage, `itinerary_images/${fileName}`); // Corrected reference
    const uploadTask = uploadBytesResumable(storageRef, file);
  
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setImageUploadProgress(progress.toFixed(0));
      },
      (error) => {
        setImageUploadError("Image upload failed");
        console.error(error);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setImageUploadProgress(null);
          setFormData((prev) => ({ ...prev, image: downloadURL }));
        } catch (error) {
          setImageUploadError("Failed to get download URL");
          console.error(error);
        }
      }
    );
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/itinary/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setPublishError(data.message);
        return;
      }

      navigate(`/dashboard?tab=itinary`);
    } catch (error) {
      setPublishError("Something went wrong");
      console.error(error);
    }
  };
  const handleCancel = () => {
    navigate(`/dashboard?tab=itinary`);
  };

  return (
    <div className="bg-green-200">
      <div className="p-3 max-w-4xl mx-auto min-h-screen flex flex-col" data-aos="fade-up">
        <h1 className="text-center text-3xl my-7 font-semibold">Add New Activity</h1>

        
        <div className="flex flex-col sm:flex-row gap-6">
          
      
          <form className="flex flex-col gap-4 w-full sm:w-3/4">
            <TextInput type="text" placeholder="Title" required id="title"
              onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            
          
            <Select onChange={handleCategoryChange}>
              <option value="">Select Category</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </Select>

       
            <div className="flex flex-wrap gap-2">
              {formData.categories.map((category, index) => (
                <Badge key={index} color="info" className="cursor-pointer" onClick={() => removeCategory(category)}>
                  {category} ×
                </Badge>
              ))}
            </div>

            <TextInput type="text" placeholder="Location" required id="location"
              onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
            <TextInput type="text" placeholder="Average Time (in hours)" required id="averageTime"
              onChange={(e) => setFormData({ ...formData, averageTime: e.target.value })} />
            <TextInput type="text" placeholder="Average Cost ($)" required id="averageCost"
              onChange={(e) => setFormData({ ...formData, averageCost: e.target.value })} />

        
            <div className="flex flex-col sm:flex-row gap-2 items-center">
              <FileInput type="file" accept="image/*" onChange={handleFileChange} className="w-full sm:w-auto" />
              <Button onClick={handleUploadImage} type="button" className="bg-gray-400 w-full sm:w-auto" disabled={!!formData.image}>
                {formData.image ? "Image Uploaded" : "Upload Image"}
              </Button>
            </div>

            {imageUploadProgress && (
              <div className="w-16 h-16">
                <CircularProgressbar value={imageUploadProgress} text={`${imageUploadProgress}%`} />
              </div>
            )}

            {imageUploadError && <Alert color="failure">{imageUploadError}</Alert>}

            {formData.image && (
              <div className="mt-3 flex justify-center sm:justify-start">
                <img src={formData.image} alt="Uploaded" className="w-32 h-32 object-cover rounded-md border" />
              </div>
            )}

            {publishError && <Alert color="failure">{publishError}</Alert>}
          </form>

        
          <div className="flex flex-col justify-end w-full  sm:w-1/4">
            <Button type="submit" className="bg-green-400 w-full sm:w-auto mb-2" onClick={handleSubmit}>Create</Button>
            <Button type="button" className="bg-black w-full sm:w-auto" onClick={handleCancel}>Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
