import React from "react";
import { Tab, Row, Col, Card, ListGroup, Badge } from "react-bootstrap";

const RoomTypesTab = ({ hotelDetails }) => {
  const rooms = hotelDetails?.room_type || [];

  return (
    <Tab eventKey="room_type" title="Room Types">
      <Row className="mt-3">
        {rooms.length === 0 ? (
          <Col>
            <p>No room type information available.</p>
          </Col>
        ) : (
          rooms.map((room, idx) => (
            <Col md={6} key={room.room_id || idx} className="mb-3">
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title>{room.title || "Unnamed Room"}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {room.description || "No description available"}
                  </Card.Subtitle>

                  {/* Room Picture if available */}
                  {room.room_pic && (
                    <Card.Img
                      variant="top"
                      src={room.room_pic}
                      alt={room.title}
                      className="mb-3 rounded"
                      style={{ maxHeight: "200px", objectFit: "cover" }}
                    />
                  )}

                  {/* Max Allowed */}
                  <h6>Max Allowed</h6>
                  <ListGroup variant="flush" className="mb-2">
                    <ListGroup.Item>
                      Total:{" "}
                      <Badge bg="secondary">
                        {room.max_allowed?.total ?? "N/A"}
                      </Badge>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      Adults:{" "}
                      <Badge bg="secondary">
                        {room.max_allowed?.adults ?? "N/A"}
                      </Badge>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      Children:{" "}
                      <Badge bg="secondary">
                        {room.max_allowed?.children ?? "N/A"}
                      </Badge>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      Infant:{" "}
                      <Badge bg="secondary">
                        {room.max_allowed?.infant ?? "N/A"}
                      </Badge>
                    </ListGroup.Item>
                  </ListGroup>

                  {/* Bed Types */}
                  <h6>Bed Types</h6>
                  {room.bed_type?.length ? (
                    <ul>
                      {room.bed_type.map((bed, i) => (
                        <li key={i}>{bed.description || "N/A"}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No bed type info</p>
                  )}

                  {/* Room Size */}
                  {room.room_size && (
                    <p>
                      <strong>Room Size:</strong> {room.room_size}
                    </p>
                  )}

                  {/* Amenities */}
                  <h6>Amenities</h6>
                  {room.amenities?.length ? (
                    <ul>
                      {room.amenities.map((am, i) => (
                        <li key={i}>{am}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No amenities info</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Tab>
  );
};

export default RoomTypesTab;
