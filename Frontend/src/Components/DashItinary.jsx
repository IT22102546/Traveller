import { Button, Modal, Table } from "flowbite-react";
import { useEffect, useState } from "react";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { jsPDF } from "jspdf"; // Import jsPDF

export default function DashItinary() {
  const { currentUser } = useSelector((state) => state.user);
  const [itineraries, setItineraries] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [itineraryIdToDelete, setItineraryIdToDelete] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchItineraries = async () => {
      try {
        const res = await fetch(`/api/itinary?searchTerm=${searchTerm}`);
        const data = await res.json();
        if (res.ok) {
          const sortedData = data.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setItineraries(sortedData);
        }
      } catch (error) {
        console.error("Error fetching itineraries:", error);
      }
    };
    fetchItineraries();
  }, [searchTerm]);

  const handleDeleteItinerary = async () => {
    setShowModal(false);
    try {
      const res = await fetch(`/api/itinary/${itineraryIdToDelete}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setItineraries((prev) =>
          prev.filter((itinerary) => itinerary._id !== itineraryIdToDelete)
        );
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Generate PDF Report
  const generateReport = () => {
    const doc = new jsPDF();
    const startX = 14;
    let startY = 20;
    const lineHeight = 10;
  
    // Title
    doc.setFontSize(18);
    doc.text("Itinerary Report", startX, startY);
  
    // Search term
    startY += lineHeight;
    doc.setFontSize(12);
    doc.text(`Search Term: ${searchTerm || "All"}`, startX, startY);
  
    // Table headers
    startY += lineHeight;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Title", startX, startY);
    doc.text("Categories", startX + 40, startY);
    doc.text("Location", startX + 90, startY);
    doc.text("Avg Time", startX + 130, startY);
    doc.text("Avg Cost", startX + 160, startY);
  
    // Reset font for table content
    doc.setFont("helvetica", "normal");
  
    // Table data
    startY += 6;
    itineraries.forEach((itinerary) => {
      doc.text(itinerary.title || "-", startX, startY);
      doc.text((itinerary.categories || []).join(", ") || "-", startX + 40, startY);
      doc.text(itinerary.location || "-", startX + 90, startY);
      doc.text(itinerary.averageTime?.toString() || "-", startX + 130, startY);
      doc.text(itinerary.averageCost?.toString() || "-", startX + 160, startY);
      startY += 8;
  
      // Create a new page if content exceeds page height
      if (startY > 280) {
        doc.addPage();
        startY = 20;
      }
    });
  
    
    doc.save("itinerary_report.pdf");
  };
  

  return (
    <div className="table-auto overflow-x-scroll md:mx-auto p-3 mt-20">
      <div className="flex justify-between mb-2">
        <input
          type="text"
          placeholder="Search Itineraries.."
          value={searchTerm}
          onChange={handleSearch}
          className="px-3 py-2 w-150 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 mr-2 h-10"
        />

        {/* Generate Report Button */}
        <button
          onClick={generateReport}
          className="bg-green-500 hover:bg-green-600 px-4 rounded-xl text-white"
        >
          Generate Report
        </button>
      </div>

      {currentUser.isAdmin && itineraries.length > 0 ? (
        <Table hoverable className="shadow-md">
          <Table.Head>
            <Table.HeadCell>Title</Table.HeadCell>
            <Table.HeadCell>Categories</Table.HeadCell>
            <Table.HeadCell>Image</Table.HeadCell>
            <Table.HeadCell>Average Time</Table.HeadCell>
            <Table.HeadCell>Average Cost</Table.HeadCell>
            <Table.HeadCell>Location</Table.HeadCell>
            <Table.HeadCell>Delete</Table.HeadCell>
            <Table.HeadCell>Edit</Table.HeadCell>
          </Table.Head>
          {itineraries.map((itinerary) => (
            <Table.Body className="divide-y" key={itinerary._id}>
              <Table.Row>
                <Table.Cell>{itinerary.title}</Table.Cell>
                <Table.Cell>{itinerary.categories.join(", ")}</Table.Cell>
                <Table.Cell>
                  <img
                    src={itinerary.image}
                    alt={itinerary.title}
                    className="w-20 h-10 object-cover"
                  />
                </Table.Cell>
                <Table.Cell>{itinerary.averageTime}</Table.Cell>
                <Table.Cell>{itinerary.averageCost}</Table.Cell>
                <Table.Cell>{itinerary.location}</Table.Cell>
                <Table.Cell>
                  <span
                    className="text-red-500 cursor-pointer"
                    onClick={() => {
                      setShowModal(true);
                      setItineraryIdToDelete(itinerary._id);
                    }}
                  >
                    Delete
                  </span>
                </Table.Cell>
                <Table.Cell>
                  <Link
                    className="text-teal-500"
                    to={`/update-itinerary/${itinerary._id}`}
                  >
                    Edit
                  </Link>
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          ))}
        </Table>
      ) : (
        <p>No itineraries available</p>
      )}

      <Modal
        show={showModal}
        onClose={() => setShowModal(false)}
        popup
        size="md"
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="h-14 w-14 text-gray-400 mb-4 mx-auto" />
            <h3 className="mb-5 text-lg">
              Are you sure you want to delete this itinerary?
            </h3>
          </div>
          <div className="flex justify-center gap-4">
            <Button color="failure" onClick={handleDeleteItinerary}>
              Yes, delete it
            </Button>
            <Button color="gray" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}