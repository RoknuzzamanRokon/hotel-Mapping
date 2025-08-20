import React, { useState, useEffect } from "react";
import {
  Container,
  Form,
  Button,
  Table,
  Alert,
  Card,
  Row,
  Col,
  Spinner,
  DropdownButton,
  Dropdown,
  Modal,
  Tab,
  Tabs,
  ListGroup,
  Badge,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { pushHotels, getHotelDetails } from "./api";

function App() {
  const [supplier, setSupplier] = useState("hotelbeds");
  const [hotelIds, setHotelIds] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedCard, setExpandedCard] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [hotelDetails, setHotelDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);

  // New state for the top availability check
  const [checkSupplier, setCheckSupplier] = useState("hotelbeds");
  const [checkHotelId, setCheckHotelId] = useState("");
  const [checkLoading, setCheckLoading] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [checkError, setCheckError] = useState(null);

  const supplierOptions = [
    { id: "hotelbeds", name: "Hotelbeds" },
    { id: "tbohotel", name: "TBO Hotels" },
    { id: "agoda", name: "Agoda" },
    { id: "ean", name: "Expedia" },
    { id: "booking", name: "Booking.com" },
  ];

  // NEW: Function to handle top availability check
  const handleTopCheckAvailability = async () => {
    if (!checkHotelId.trim()) return;

    setCheckLoading(true);
    setCheckError(null);
    setCheckResult(null);

    try {
      const data = await getHotelDetails(checkSupplier, checkHotelId);
      setCheckResult(data);
    } catch (err) {
      setCheckError("Hotel not found or error occurred");
    } finally {
      setCheckLoading(false);
    }
  };

  // Reset top check when supplier changes
  useEffect(() => {
    setCheckResult(null);
    setCheckError(null);
  }, [checkSupplier]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hotelIds.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const hotelArray = hotelIds
        .split(/[\n,]+/)
        .map((id) => id.trim())
        .filter((id) => id.length > 0);

      const data = await pushHotels(supplier, hotelArray);
      setResults(data.results);
      setExpandedCard(true);
    } catch (err) {
      setError("Failed to process request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setHotelIds("");
    setResults([]);
    setError(null);
    setExpandedCard(false);
  };

  const getStatusBadge = (status) => {
    const variant = status === "saved" ? "success" : "danger";
    return <Badge bg={variant}>{status.toUpperCase()}</Badge>;
  };

  const fetchHotelDetails = async (hotel_id) => {
    setShowDetails(true);
    setLoadingDetails(true);
    setErrorDetails(null);

    try {
      const data = await getHotelDetails(supplier, hotel_id);
      setHotelDetails(data);
    } catch (err) {
      setErrorDetails("Failed to fetch hotel details.");
    } finally {
      setLoadingDetails(false);
    }
  };

  // Reset details when supplier changes
  useEffect(() => {
    setHotelDetails(null);
  }, [supplier]);

  return (
    <Container className="mt-4">
      {/* NEW: Top Hotel Availability Check Section */}
      <Row className="justify-content-center mb-4">
        <Col md={10} lg={8}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-info text-white py-3">
              <h2 className="mb-0">Check Hotel Availability</h2>
              <small className="opacity-75">
                Verify hotel existence and view details
              </small>
            </Card.Header>

            <Card.Body>
              <Row className="align-items-center">
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Supplier</Form.Label>
                    <DropdownButton
                      id="top-supplier-dropdown"
                      title={
                        supplierOptions.find((s) => s.id === checkSupplier)
                          ?.name || "Select Supplier"
                      }
                      variant="outline-secondary"
                      className="w-100"
                    >
                      {supplierOptions.map((option) => (
                        <Dropdown.Item
                          key={option.id}
                          active={checkSupplier === option.id}
                          onClick={() => setCheckSupplier(option.id)}
                        >
                          {option.name}
                        </Dropdown.Item>
                      ))}
                    </DropdownButton>
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Hotel ID</Form.Label>
                    <Form.Control
                      type="text"
                      value={checkHotelId}
                      onChange={(e) => setCheckHotelId(e.target.value)}
                      placeholder="Enter hotel ID"
                      className="border-2"
                      style={{ borderColor: "#ced4da" }}
                    />
                  </Form.Group>
                </Col>

                <Col md={4} className="d-flex">
                  <Button
                    variant="primary"
                    onClick={handleTopCheckAvailability}
                    disabled={checkLoading || !checkHotelId.trim()}
                    className="w-100"
                  >
                    {checkLoading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Checking...
                      </>
                    ) : (
                      "Check Availability"
                    )}
                  </Button>
                </Col>
              </Row>

              {checkError && (
                <Alert variant="danger" className="mt-3">
                  <i className="bi bi-exclamation-circle me-2"></i>
                  {checkError}
                </Alert>
              )}

              {checkResult && (
                <div className="mt-3 p-3 bg-light rounded">
                  <Row className="align-items-center">
                    <Col md={9}>
                      <h4 className="mb-1">
                        {checkResult.name}
                        {checkResult.star_rating && (
                          <span className="ms-2">
                            <Badge bg="warning" className="text-dark">
                              {Array.from({
                                length: parseInt(checkResult.star_rating),
                              }).map((_, i) => (
                                <i key={i} className="bi bi-star-fill ms-1"></i>
                              ))}
                            </Badge>
                          </span>
                        )}
                      </h4>
                      <p className="mb-0 text-muted">
                        {checkResult.address?.city},{" "}
                        {checkResult.address?.country}
                      </p>
                    </Col>
                    <Col md={3} className="text-end">
                      <Button
                        variant="info"
                        onClick={() => {
                          setHotelDetails(checkResult);
                          setShowDetails(true);
                        }}
                      >
                        <i className="bi bi-info-circle me-1"></i>
                        View Details
                      </Button>
                    </Col>
                  </Row>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Existing Push Hotel Data Section */}
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-primary text-white py-3">
              <h2 className="mb-0">Push Hotel Data</h2>
              <small className="opacity-75">
                Push hotel data to storage system
              </small>
            </Card.Header>

            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Supplier</Form.Label>
                      <DropdownButton
                        id="supplier-dropdown"
                        title={
                          supplierOptions.find((s) => s.id === supplier)
                            ?.name || "Select Supplier"
                        }
                        variant="outline-secondary"
                        className="w-100"
                      >
                        {supplierOptions.map((option) => (
                          <Dropdown.Item
                            key={option.id}
                            active={supplier === option.id}
                            onClick={() => setSupplier(option.id)}
                          >
                            {option.name}
                          </Dropdown.Item>
                        ))}
                      </DropdownButton>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <div className="d-flex align-items-end h-100">
                      <div className="text-muted">
                        <small>
                          Selected:{" "}
                          <span className="fw-bold">
                            {
                              supplierOptions.find((s) => s.id === supplier)
                                ?.name
                            }
                          </span>
                        </small>
                      </div>
                    </div>
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold">
                    Hotel IDs
                    <small className="text-muted ms-2">
                      (Comma or newline separated)
                    </small>
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={6}
                    value={hotelIds}
                    onChange={(e) => setHotelIds(e.target.value)}
                    placeholder="Enter hotel IDs, separated by commas or new lines"
                    className="border-2"
                    style={{ borderColor: "#ced4da" }}
                    required
                  />
                </Form.Group>

                <div className="d-flex justify-content-between mt-4">
                  <Button
                    variant="outline-secondary"
                    onClick={handleReset}
                    disabled={loading}
                  >
                    Clear All
                  </Button>

                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading || !hotelIds.trim()}
                    className="px-4"
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Processing...
                      </>
                    ) : (
                      "Process Hotels"
                    )}
                  </Button>
                </div>
              </Form>

              {error && (
                <Alert variant="danger" className="mt-4">
                  <i className="bi bi-exclamation-circle me-2"></i>
                  {error}
                </Alert>
              )}
            </Card.Body>
          </Card>

          {results.length > 0 && (
            <Card
              className={`mt-4 shadow-sm border-0 ${
                expandedCard ? "show" : ""
              }`}
            >
              <Card.Header
                className="bg-light d-flex justify-content-between align-items-center py-3 cursor-pointer"
                onClick={() => setExpandedCard(!expandedCard)}
              >
                <h3 className="mb-0">Processing Results</h3>
                <i
                  className={`bi bi-chevron-${expandedCard ? "up" : "down"}`}
                ></i>
              </Card.Header>

              {expandedCard && (
                <Card.Body>
                  <div className="d-flex mb-3">
                    <div className="me-4">
                      <small className="text-muted">Total Hotels</small>
                      <h4 className="mb-0">{results.length}</h4>
                    </div>
                    <div className="me-4">
                      <small className="text-muted">Success</small>
                      <h4 className="mb-0 text-success">
                        {results.filter((r) => r.status === "saved").length}
                      </h4>
                    </div>
                    <div>
                      <small className="text-muted">Failed</small>
                      <h4 className="mb-0 text-danger">
                        {results.filter((r) => r.status === "failed").length}
                      </h4>
                    </div>
                  </div>

                  <div className="table-responsive">
                    <Table striped hover className="mb-0">
                      <thead className="table-light">
                        <tr>
                          <th width="20%">Hotel ID</th>
                          <th width="20%">Status</th>
                          <th>Details</th>
                          <th width="15%">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((result, index) => (
                          <tr key={index}>
                            <td className="fw-medium">{result.hotel_id}</td>
                            <td>{getStatusBadge(result.status)}</td>
                            <td>
                              {result.status === "saved" ? (
                                <div>
                                  <div className="text-success">
                                    <i className="bi bi-check-circle me-1"></i>
                                    Successfully saved
                                  </div>

                                </div>
                              ) : (
                                <div className="text-danger">
                                  <i className="bi bi-exclamation-triangle me-1"></i>
                                  {result.reason || "Error processing"}
                                </div>
                              )}
                            </td>
                            <td>
                              <Button
                                variant="outline-info"
                                size="sm"
                                onClick={() =>
                                  fetchHotelDetails(result.hotel_id)
                                }
                                disabled={result.status === "failed"}
                              >
                                <i className="bi bi-info-circle me-1"></i>
                                Details
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>


                </Card.Body>
              )}
            </Card>
          )}
        </Col>
      </Row>

      {/* Hotel Details Modal */}
      <Modal
        show={showDetails}
        onHide={() => setShowDetails(false)}
        size="xl"
        centered
        scrollable
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>
            {loadingDetails
              ? "Loading Hotel Details..."
              : hotelDetails?.name || "Hotel Details"}
            {hotelDetails?.star_rating && (
              <span className="ms-2">
                <Badge bg="warning" className="text-dark">
                  {Array.from({
                    length: parseInt(hotelDetails.star_rating),
                  }).map((_, i) => (
                    <i key={i} className="bi bi-star-fill ms-1"></i>
                  ))}
                </Badge>
              </span>
            )}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {loadingDetails ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading hotel details...</p>
            </div>
          ) : errorDetails ? (
            <Alert variant="danger">
              <i className="bi bi-exclamation-octagon me-2"></i>
              {errorDetails}
            </Alert>
          ) : hotelDetails ? (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  {hotelDetails.primary_photo && (
                    <div className="ratio ratio-16x9 mb-3">
                      <img
                        src={hotelDetails.primary_photo}
                        alt={hotelDetails.name}
                        className="img-fluid rounded"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  )}

                  <Card className="mb-3">
                    <Card.Body>
                      <Card.Title className="d-flex justify-content-between align-items-center">
                        <span>Contact Information</span>
                        <i className="bi bi-telephone"></i>
                      </Card.Title>

                      <ListGroup variant="flush">
                        {hotelDetails.contacts?.phone_numbers?.map(
                          (phone, i) => (
                            <ListGroup.Item
                              key={i}
                              className="d-flex align-items-center"
                            >
                              <i className="bi bi-telephone me-2"></i>
                              <a href={`tel:${phone}`}>{phone}</a>
                            </ListGroup.Item>
                          )
                        )}

                        {hotelDetails.contacts?.email_address
                          ?.filter((e) => e)
                          .map((email, i) => (
                            <ListGroup.Item
                              key={i}
                              className="d-flex align-items-center"
                            >
                              <i className="bi bi-envelope me-2"></i>
                              <a href={`mailto:${email}`}>{email}</a>
                            </ListGroup.Item>
                          ))}

                        {hotelDetails.contacts?.website
                          ?.filter((w) => w)
                          .map((site, i) => (
                            <ListGroup.Item
                              key={i}
                              className="d-flex align-items-center"
                            >
                              <i className="bi bi-globe me-2"></i>
                              <a
                                href={site}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {site.replace(/^https?:\/\//, "")}
                              </a>
                            </ListGroup.Item>
                          ))}
                      </ListGroup>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="mb-3">
                    <Card.Body>
                      <Card.Title className="d-flex justify-content-between align-items-center">
                        <span>Location</span>
                        <i className="bi bi-geo-alt"></i>
                      </Card.Title>

                      <div className="mb-3">
                        <div className="fw-medium">
                          {hotelDetails.address?.full_address}
                        </div>
                        <small className="text-muted">
                          {hotelDetails.address?.city},{" "}
                          {hotelDetails.address?.country}
                        </small>
                      </div>

                      <div className="d-flex mb-3">
                        <div className="me-3">
                          <small className="text-muted">Latitude</small>
                          <div>{hotelDetails.address?.latitude}</div>
                        </div>
                        <div>
                          <small className="text-muted">Longitude</small>
                          <div>{hotelDetails.address?.longitude}</div>
                        </div>
                      </div>

                      <Button
                        variant="outline-primary"
                        size="sm"
                        as="a"
                        href={hotelDetails.address?.google_map_site_link}
                        target="_blank"
                      >
                        <i className="bi bi-map me-1"></i>
                        View on Google Maps
                      </Button>
                    </Card.Body>
                  </Card>

                  <Card className="mb-3">
                    <Card.Body>
                      <Card.Title className="d-flex justify-content-between align-items-center">
                        <span>Check-in/Check-out</span>
                        <i className="bi bi-clock"></i>
                      </Card.Title>

                      <div className="d-flex justify-content-around text-center">
                        <div>
                          <small className="text-muted">Check-in</small>
                          <div className="fw-medium">
                            {hotelDetails.policies?.checkin?.begin_time ||
                              "N/A"}
                          </div>
                        </div>
                        <div>
                          <small className="text-muted">Check-out</small>
                          <div className="fw-medium">
                            {hotelDetails.policies?.checkout?.time || "N/A"}
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Tabs defaultActiveKey="description" className="mb-3">
                <Tab eventKey="description" title="Description">
                  <div className="p-3">
                    {hotelDetails.descriptions?.map((desc, i) => (
                      <p key={i} className="mb-3">
                        {desc.text}
                      </p>
                    ))}

                    {!hotelDetails.descriptions?.length && (
                      <p className="text-muted">No description available</p>
                    )}
                  </div>
                </Tab>

                <Tab eventKey="rooms" title="Room Types">
                  <div className="p-3">
                    {hotelDetails.room_type?.length ? (
                      <Row xs={1} md={2} lg={3} className="g-3">
                        {hotelDetails.room_type.map((room, i) => (
                          <Col key={i}>
                            <Card className="h-100">
                              {room.room_pic && (
                                <Card.Img
                                  variant="top"
                                  src={room.room_pic}
                                  height="150"
                                  style={{ objectFit: "cover" }}
                                />
                              )}
                              <Card.Body>
                                <Card.Title>
                                  {room.title || room.room_id}
                                </Card.Title>
                                <Card.Text className="text-muted small">
                                  {room.description ||
                                    "No description available"}
                                </Card.Text>

                                <ListGroup variant="flush">
                                  <ListGroup.Item className="d-flex justify-content-between">
                                    <span>Max Guests:</span>
                                    <span>
                                      {room.max_allowed?.total || "N/A"}
                                    </span>
                                  </ListGroup.Item>
                                  <ListGroup.Item className="d-flex justify-content-between">
                                    <span>Bed Type:</span>
                                    <span>
                                      {room.bed_type?.join(", ") ||
                                        "Not specified"}
                                    </span>
                                  </ListGroup.Item>
                                  <ListGroup.Item className="d-flex justify-content-between">
                                    <span>Room Size:</span>
                                    <span>
                                      {room.room_size
                                        ? `${room.room_size} sq ft`
                                        : "N/A"}
                                    </span>
                                  </ListGroup.Item>
                                </ListGroup>
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    ) : (
                      <p className="text-muted">
                        No room information available
                      </p>
                    )}
                  </div>
                </Tab>

                <Tab eventKey="policies" title="Policies">
                  <div className="p-3">
                    <h5>Child & Extra Bed Policy</h5>
                    <ul className="list-unstyled">
                      <li>
                        <strong>Infant Age:</strong>{" "}
                        {hotelDetails.policies?.child_and_extra_bed_policy
                          ?.infant_age || "N/A"}
                      </li>
                      <li>
                        <strong>Children Age Range:</strong>{" "}
                        {hotelDetails.policies?.child_and_extra_bed_policy
                          ?.children_age_from || "N/A"}{" "}
                        -{" "}
                        {hotelDetails.policies?.child_and_extra_bed_policy
                          ?.children_age_to || "N/A"}
                      </li>
                      <li>
                        <strong>Children Stay Free:</strong>{" "}
                        {hotelDetails.policies?.child_and_extra_bed_policy
                          ?.children_stay_free || "N/A"}
                      </li>
                    </ul>

                    <h5 className="mt-4">Other Policies</h5>
                    <p className="text-muted">
                      {hotelDetails.policies?.know_before_you_go ||
                        "No additional policy information"}
                    </p>
                  </div>
                </Tab>

                {/* New Amenities & Facilities Tab */}
                <Tab eventKey="amenities" title="Amenities & Facilities">
                  <div className="p-3">
                    <h5>Spoken Languages</h5>
                    <div className="d-flex flex-wrap gap-2 mb-4">
                      {hotelDetails.spoken_languages?.length ? (
                        hotelDetails.spoken_languages.map((lang, i) => (
                          <Badge key={i} bg="info" className="fs-6 p-2">
                            <i
                              className={`bi ${
                                lang.icon || "bi-translate"
                              } me-1`}
                            ></i>
                            {lang.title}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-muted">No language information</p>
                      )}
                    </div>

                    <h5>Amenities</h5>
                    <Row xs={2} md={3} lg={4} className="g-3 mb-4">
                      {hotelDetails.amenities?.length ? (
                        hotelDetails.amenities.map((amenity, i) => (
                          <Col key={i}>
                            <div className="border rounded p-3 text-center h-100">
                              <i
                                className={`bi ${
                                  amenity.icon || "bi-check-circle"
                                } fs-2 mb-2 d-block`}
                              ></i>
                              <div>{amenity.title || "Amenity"}</div>
                            </div>
                          </Col>
                        ))
                      ) : (
                        <p className="text-muted">No amenities listed</p>
                      )}
                    </Row>

                    <h5>Facilities</h5>
                    <Row xs={2} md={3} lg={4} className="g-3">
                      {hotelDetails.facilities?.length ? (
                        hotelDetails.facilities.map((facility, i) => (
                          <Col key={i}>
                            <div className="border rounded p-3 text-center h-100">
                              <i
                                className={`bi ${
                                  facility.icon || "bi-building"
                                } fs-2 mb-2 d-block`}
                              ></i>
                              <div>{facility.title || "Facility"}</div>
                            </div>
                          </Col>
                        ))
                      ) : (
                        <p className="text-muted">No facilities listed</p>
                      )}
                    </Row>
                  </div>
                </Tab>

                {/* New Photos Tab */}
                <Tab eventKey="photos" title="Photos">
                  <div className="p-3">
                    <h5 className="mb-4">Hotel Gallery</h5>
                    <Row xs={1} md={2} lg={3} className="g-4">
                      {hotelDetails.hotel_photo?.length ? (
                        hotelDetails.hotel_photo.map((photo, i) => (
                          <Col key={i}>
                            <Card className="h-100">
                              <Card.Img
                                variant="top"
                                src={photo.url}
                                height="200"
                                style={{ objectFit: "cover" }}
                              />
                              <Card.Body>
                                <Card.Title className="fs-6">
                                  {photo.title || "Hotel Photo"}
                                </Card.Title>
                              </Card.Body>
                            </Card>
                          </Col>
                        ))
                      ) : (
                        <p className="text-muted">No photos available</p>
                      )}
                    </Row>
                  </div>
                </Tab>

                {/* New Nearby Tab */}
                <Tab eventKey="nearby" title="Nearby Points">
                  <div className="p-3">
                    <h5>Nearest Airports</h5>
                    <ListGroup className="mb-4">
                      {hotelDetails.nearest_airports?.length ? (
                        hotelDetails.nearest_airports.map((airport, i) => (
                          <ListGroup.Item
                            key={i}
                            className="d-flex justify-content-between"
                          >
                            <span>
                              <i className="bi bi-airplane me-2"></i>
                              {airport.name}
                            </span>
                            <Badge bg="secondary">{airport.code}</Badge>
                          </ListGroup.Item>
                        ))
                      ) : (
                        <p className="text-muted">No airport information</p>
                      )}
                    </ListGroup>

                    <h5>Points of Interest</h5>
                    <ListGroup className="mb-4">
                      {hotelDetails.point_of_interests?.length ? (
                        hotelDetails.point_of_interests.map((poi, i) => (
                          <ListGroup.Item key={i}>
                            <i className="bi bi-geo-alt me-2"></i>
                            {poi.name}
                          </ListGroup.Item>
                        ))
                      ) : (
                        <p className="text-muted">
                          No points of interest listed
                        </p>
                      )}
                    </ListGroup>

                    <h5>Connected Locations</h5>
                    <ListGroup className="mb-4">
                      {hotelDetails.connected_locations?.length ? (
                        hotelDetails.connected_locations.map((loc, i) => (
                          <ListGroup.Item key={i}>
                            <i className="bi bi-link-45deg me-2"></i>
                            {loc.name}
                          </ListGroup.Item>
                        ))
                      ) : (
                        <p className="text-muted">No connected locations</p>
                      )}
                    </ListGroup>

                    <h5>Stadiums</h5>
                    <ListGroup>
                      {hotelDetails.stadiums?.length ? (
                        hotelDetails.stadiums.map((stadium, i) => (
                          <ListGroup.Item key={i}>
                            <i className="bi bi-trophy me-2"></i>
                            {stadium.name}
                          </ListGroup.Item>
                        ))
                      ) : (
                        <p className="text-muted">No stadiums nearby</p>
                      )}
                    </ListGroup>
                  </div>
                </Tab>
              </Tabs>
            </>
          ) : null}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetails(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <footer className="mt-5 text-center text-muted">
        <small>
          © {new Date().getFullYear()} Hotel Mapping API | Data Processing
          System v1.0
        </small>
      </footer>
    </Container>
  );
}

export default App;
