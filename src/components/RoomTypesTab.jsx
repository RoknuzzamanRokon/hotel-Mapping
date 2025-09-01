import React, { useState } from "react";
import { Row, Col, Card, Button, Modal, Badge } from "react-bootstrap";

function RoomTypesTab({ roomTypes }) {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const noRoomFoundImage =
    "https://hoteljson.innsightmap.com/test1/no_room_picture_found.png";

  return (
    <>
      <Row className="mt-3">
        <Col>
          <h4 className="mb-4 border-bottom pb-2">Available Room Types</h4>
          {roomTypes.length === 0 ? (
            <div className="text-muted text-center py-5">
              <div className="mb-3" style={{ fontSize: "3em" }}>
                🛏️
              </div>
              <h5>No room types available</h5>
              <p>Please check back later for room availability.</p>
            </div>
          ) : (
            <Row>
              {roomTypes.map((room, i) => (
                <Col
                  key={room.room_id ?? i}
                  xs={12}
                  md={6}
                  lg={4}
                  className="mb-4"
                >
                  <Card className="h-100 room-card shadow-sm">
                    {/* Room Image with overlay badge */}
                    <div
                      className="position-relative"
                      style={{ height: "200px", overflow: "hidden" }}
                    >
                      <img
                        src={room.room_pic ? room.room_pic : noRoomFoundImage}
                        alt={room.title || `room-${i}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = noRoomFoundImage;
                        }}
                      />
                      <Badge
                        bg="primary"
                        className="position-absolute"
                        style={{ top: "10px", right: "10px" }}
                      >
                        {room.room_id}
                      </Badge>
                    </div>

                    <Card.Body className="d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <Card.Title className="h6 mb-0 text-truncate">
                          {room.title}
                        </Card.Title>
                        <Badge bg="light" text="dark" className="ms-2">
                          📏 {room.room_size || "N/A"}
                        </Badge>
                      </div>

                      <p
                        className="text-muted small flex-grow-1"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: "3",
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {room.description}
                      </p>

                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                          <small className="text-muted">
                            👤 {room.max_allowed?.adults || 0} Adults
                          </small>
                          <small className="text-muted ms-2">
                            👶 {room.max_allowed?.children || 0} Children
                          </small>
                        </div>
                      </div>

                      <Button
                        variant="outline-primary"
                        onClick={() => setSelectedRoom(room)}
                        className="mt-auto"
                      >
                        View Details
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>

      {/* Room Details Modal */}
      <Modal
        show={!!selectedRoom}
        onHide={() => setSelectedRoom(null)}
        size="lg"
        centered
      >
        {selectedRoom && (
          <>
            <Modal.Header closeButton className="border-0 pb-0">
              <Modal.Title>{selectedRoom.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Row>
                <Col md={6}>
                  <div
                    className="mb-3"
                    style={{
                      borderRadius: "12px",
                      overflow: "hidden",
                      height: "250px",
                    }}
                  >
                    <img
                      src={
                        selectedRoom.room_pic
                          ? selectedRoom.room_pic
                          : noRoomFoundImage
                      }
                      alt={selectedRoom.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = noRoomFoundImage;
                      }}
                    />
                  </div>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    <Badge
                      bg="light"
                      text="dark"
                      className="d-flex align-items-center"
                    >
                      👤 {selectedRoom.max_allowed?.adults || 0} Adults
                    </Badge>
                    <Badge
                      bg="light"
                      text="dark"
                      className="d-flex align-items-center"
                    >
                      👶 {selectedRoom.max_allowed?.children || 0} Children
                    </Badge>
                    <Badge
                      bg="light"
                      text="dark"
                      className="d-flex align-items-center"
                    >
                      📏 {selectedRoom.room_size || "N/A"}
                    </Badge>
                  </div>
                </Col>
                <Col md={6}>
                  <h6>Description</h6>
                  <p className="text-muted">{selectedRoom.description}</p>

                  <h6 className="mt-4">Bed Types</h6>
                  <ul className="list-unstyled">
                    {selectedRoom.bed_type?.map((bed, idx) => (
                      <li key={idx} className="mb-1">
                        🛏️ {bed.description}
                      </li>
                    ))}
                  </ul>

                  <h6 className="mt-4">Amenities</h6>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, 1fr)",
                      gap: "8px",
                    }}
                  >
                    {selectedRoom.amenities?.map((amenity, idx) => (
                      <div key={idx} className="d-flex align-items-center">
                        {amenity.toLowerCase().includes("bathroom") ||
                        amenity.toLowerCase().includes("bathtub") ||
                        amenity.toLowerCase().includes("shower")
                          ? "🚿 "
                          : amenity.toLowerCase().includes("wifi") ||
                            amenity.toLowerCase().includes("internet")
                          ? "📶 "
                          : amenity.toLowerCase().includes("tv") ||
                            amenity.toLowerCase().includes("television")
                          ? "📺 "
                          : amenity
                              .toLowerCase()
                              .includes("air conditioning") ||
                            amenity.toLowerCase().includes("ac")
                          ? "❄️ "
                          : amenity.toLowerCase().includes("dining") ||
                            amenity.toLowerCase().includes("restaurant")
                          ? "🍴 "
                          : "✅ "}
                        {amenity}
                      </div>
                    ))}
                  </div>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer className="border-0">
              <Button
                variant="outline-secondary"
                onClick={() => setSelectedRoom(null)}
              >
                Close
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>

      <style>{`
        .room-card {
          transition: transform 0.3s, box-shadow 0.3s;
          border-radius: 12px;
          overflow: hidden;
          border: none;
        }
        
        .room-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
        }
        
        @media (max-width: 768px) {
          .amenities-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}

export default RoomTypesTab;
