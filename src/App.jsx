// App.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  ProgressBar,
  Table,
  Modal,
  ListGroup,
  Badge,
  Spinner,
  Alert,
  Tabs,
  Tab,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { pushHotels, getHotelDetails } from "./api";
import RoomTypesTab from "./components/RoomTypesTab";


export default function App() {
  const [supplier, setSupplier] = useState("hotelbeds");
  const [hotelIds, setHotelIds] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [checkSupplier, setCheckSupplier] = useState("hotelbeds");
  const [checkHotelId, setCheckHotelId] = useState("");
  const [checkLoading, setCheckLoading] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [checkError, setCheckError] = useState(null);

  const [showDetails, setShowDetails] = useState(false);
  const [hotelDetails, setHotelDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);

  const textRef = useRef(null);

  const supplierOptions = [
    { id: "hotelbeds", name: "Hotelbeds" },
    { id: "tbohotel", name: "TBO Hotels" },
    { id: "agoda", name: "Agoda" },
    { id: "ean", name: "Expedia" },
    { id: "grnconnect", name: "GRN Connect" },
    { id: "restel", name: "Restel" },
    { id: "dotw", name: "DOTW" },
    { id: "paximum", name: "Paximum" },
    { id: "amadeushotel", name: "Amadeus Hotel" },
    { id: "goglobal", name: "GoGlobal" },
    { id: "hotelston", name: "Hotelston" },
    { id: "hyperguestdirect", name: "HyperGuest Direct" },
    { id: "illusionshotel", name: "Illusions Hotel" },
    { id: "innstant", name: "Innstant" },
    { id: "irixhotel", name: "Irix Hotel" },
    { id: "juniperhotel", name: "Juniper Hotel" },
    { id: "letsflyhotel", name: "LetsFly Hotel" },
    { id: "rakuten", name: "Rakuten" },
  ];

  const parseHotelInput = (text) =>
    (text || "")
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

  // SUBMIT bulk
  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    const ids = parseHotelInput(hotelIds);
    if (!ids.length) return setError("Please enter at least one hotel ID.");
    setError(null);
    setLoading(true);

    try {
      // Log what we're sending to the API
      const requestData = {
        supplier_code: supplier,
        hotel_id: ids,
      };

      console.log("Sending to API:", requestData);

      const data = await pushHotels(supplier, ids);

      // Process the API response
      setResults(data?.results ?? data ?? []);
    } catch (err) {
      console.error("API Error details:", err.response || err);
      setError(`Failed to process request: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Ctrl/Cmd + Enter to submit from textarea
  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        handleSubmit();
      }
    };
    el.addEventListener("keydown", handler);
    return () => el.removeEventListener("keydown", handler);
  }, [supplier, hotelIds]);

  const handleReset = () => {
    setHotelIds("");
    setResults([]);
    setError(null);
  };

  // Quick single-check
  const handleTopCheckAvailability = async () => {
    if (!checkHotelId.trim()) return;
    setCheckLoading(true);
    setCheckError(null);
    setCheckResult(null);
    try {
      const data = await getHotelDetails(checkSupplier, checkHotelId.trim());
      setCheckResult(data);
    } catch (err) {
      console.error(err);
      setCheckError(`Hotel not found or API error: ${err.message}`);
    } finally {
      setCheckLoading(false);
    }
  };

  const fetchHotelDetails = async (hotel_id, localSupplier = supplier) => {
    setShowDetails(true);
    setLoadingDetails(true);
    setErrorDetails(null);
    setHotelDetails(null);
    try {
      const data = await getHotelDetails(localSupplier, hotel_id);
      setHotelDetails(data);
    } catch (err) {
      console.error(err);
      setErrorDetails(`Failed to fetch hotel details: ${err.message}`);
    } finally {
      setLoadingDetails(false);
    }
  };

  // CSV / file upload (reads first column or newline separated IDs)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = String(ev.target.result);
      // try CSV by taking numeric tokens separated by comma/newline
      const ids = parseHotelInput(
        text.replace(/\r/g, "\n").replace(/,+/g, ",")
      );
      setHotelIds((prev) =>
        prev ? prev + "\n" + ids.join(",") : ids.join(",")
      );
    };
    reader.readAsText(file);
  };

  // helpers for UI
  const total = results.length;
  const successCount = results.filter((r) => r.status === "saved").length;
  const failedCount = results.filter((r) => r.status === "failed").length;
  const progressPercent = total ? Math.round((successCount / total) * 100) : 0;

    return (
      <div className="d-flex flex-column min-vh-100">
    <Container className="py-4">
      <header className="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h3 className="mb-0">Hotel Mapping UI</h3>
          <small className="text-muted">
            Push hotel IDs • Quick check • Details
          </small>
        </div>
        <div className="text-muted text-end">
          <small>v1.2</small>
        </div>
      </header>

      <Row className="gy-3">
        {/* LEFT: Main content */}
        <Col lg={8}>
          <Card className="mb-3 shadow-sm">
            <Card.Body>
              <h5>Quick Availability Check</h5>
              <div className="d-flex gap-2 align-items-end flex-wrap">
                <Form.Select
                  value={checkSupplier}
                  onChange={(e) => setCheckSupplier(e.target.value)}
                  style={{ maxWidth: 200 }}
                >
                  {supplierOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Form.Select>

                <Form.Control
                  placeholder="Enter hotel id"
                  value={checkHotelId}
                  onChange={(e) => setCheckHotelId(e.target.value)}
                  style={{ maxWidth: 300 }}
                />

                <Button
                  variant="info"
                  onClick={handleTopCheckAvailability}
                  disabled={checkLoading}
                >
                  {checkLoading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    "Check"
                  )}
                </Button>

                <Button
                  variant="outline-secondary"
                  onClick={() => {
                    setCheckHotelId("");
                    setCheckResult(null);
                    setCheckError(null);
                  }}
                >
                  Clear
                </Button>
              </div>

              {checkError && (
                <div className="mt-2 text-danger">{checkError}</div>
              )}

              {checkResult && (
                <Card className="mt-3 bg-light">
                  <Card.Body className="p-2">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{checkResult.name || "Unnamed Hotel"}</strong>
                        <div className="text-muted small">
                          {checkResult.address?.city},{" "}
                          {checkResult.address?.country}
                        </div>
                      </div>

                      <div className="text-end">
                        {checkResult.star_rating && (
                          <Badge bg="warning" text="dark" className="me-2">
                            {checkResult.star_rating}★
                          </Badge>
                        )}
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => {
                            setHotelDetails(checkResult);
                            setShowDetails(true);
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              )}
            </Card.Body>
          </Card>

          <Card className="mb-3 shadow-sm">
            <Card.Body>
              <h5>Bulk Push Hotels</h5>

              <Form onSubmit={handleSubmit}>
                <Row className="mb-2">
                  <Col sm={6}>
                    <Form.Group>
                      <Form.Label className="small">Supplier</Form.Label>
                      <Form.Select
                        value={supplier}
                        onChange={(e) => setSupplier(e.target.value)}
                      >
                        {supplierOptions.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col sm={6} className="d-flex align-items-end gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => setHotelIds("")}
                      disabled={loading}
                    >
                      Clear
                    </Button>

                    <Button
                      variant="success"
                      type="submit"
                      disabled={loading || !hotelIds.trim()}
                    >
                      {loading ? (
                        <>
                          <Spinner
                            animation="border"
                            size="sm"
                            className="me-2"
                          />
                          Processing...
                        </>
                      ) : (
                        "Process Hotels"
                      )}
                    </Button>
                  </Col>
                </Row>

                <Form.Group className="mb-2">
                  <Form.Label className="small">
                    Hotel IDs (comma or newline separated)
                    <input
                      type="file"
                      id="fileUpload"
                      style={{ display: "none" }}
                      onChange={handleFileUpload}
                      accept=".csv,.txt"
                    />
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={6}
                    ref={textRef}
                    value={hotelIds}
                    onChange={(e) => setHotelIds(e.target.value)}
                    placeholder="12345,67890  or  12345\n67890"
                    style={{ fontFamily: "monospace" }}
                  />
                  <div className="text-muted small mt-1">
                    Tip: Ctrl/Cmd + Enter to submit.
                  </div>
                </Form.Group>

                {error && (
                  <Alert variant="danger" className="mb-2">
                    {error}
                  </Alert>
                )}
              </Form>
            </Card.Body>
          </Card>

          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div>
                  <strong>Processing Results</strong>
                  <div className="small text-muted">
                    {total} items • {successCount} saved • {failedCount} failed
                  </div>
                </div>
                <div style={{ width: 220 }}>
                  <ProgressBar
                    now={progressPercent}
                    label={`${progressPercent}%`}
                    variant={progressPercent === 100 ? "success" : "primary"}
                  />
                </div>
              </div>

              <div style={{ maxHeight: 340, overflow: "auto" }}>
                <Table hover size="sm" className="mb-0">
                  <thead>
                    <tr>
                      <th>Hotel ID</th>
                      <th>Status</th>
                      <th>Info</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.length ? (
                      results.map((r, idx) => (
                        <tr key={idx}>
                          <td
                            className="fw-medium"
                            style={{ fontFamily: "monospace" }}
                          >
                            {r.hotel_id}
                          </td>
                          <td>
                            {r.status === "saved" ? (
                              <Badge bg="success">
                                {r.status.toUpperCase()}
                              </Badge>
                            ) : (
                              <Badge bg="danger">
                                {(r.status || "failed").toUpperCase()}
                              </Badge>
                            )}
                          </td>
                          <td style={{ maxWidth: 300 }}>
                            {r.status === "saved" ? (
                              <div className="text-success small">Saved</div>
                            ) : (
                              <div className="text-danger small">
                                {r.reason || "Error"}
                              </div>
                            )}
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                variant="outline-info"
                                size="sm"
                                onClick={() => fetchHotelDetails(r.hotel_id)}
                                disabled={r.status === "failed"}
                              >
                                Details
                              </Button>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                onClick={() =>
                                  navigator.clipboard?.writeText(r.hotel_id)
                                }
                              >
                                Copy
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center text-muted py-4">
                          No results yet — push hotels to see results here.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* RIGHT: helpers */}
        <Col lg={4}>
          <Card className="mb-3 shadow-sm">
            <Card.Body>
              <h6>Summary</h6>
              <ListGroup variant="flush" className="mt-2">
                <ListGroup.Item>
                  Total: <strong>{total}</strong>
                </ListGroup.Item>
                <ListGroup.Item>
                  Saved:{" "}
                  <strong className="text-success">{successCount}</strong>
                </ListGroup.Item>
                <ListGroup.Item>
                  Failed: <strong className="text-danger">{failedCount}</strong>
                </ListGroup.Item>
                <ListGroup.Item>
                  Progress: <strong>{progressPercent}%</strong>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>

          <Card className="mb-3 shadow-sm">
            <Card.Body>
              <h6>Quick Actions</h6>
              <div className="d-grid gap-2 mt-2">
                <Button
                  variant="outline-secondary"
                  onClick={() => setHotelIds("")}
                >
                  Clear Input
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => setResults([])}
                >
                  Clear Results
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={() => setHotelIds("754387,133836,23418915,164")}
                >
                  Load Demo IDs
                </Button>
              </div>
            </Card.Body>
          </Card>

          <Card className="shadow-sm">
            <Card.Body>
              <h6>Tips</h6>
              <ul className="small mb-0 text-muted">
                <li>Use comma or newline to separate IDs.</li>
                <li>Check a single hotel before bulk pushing.</li>
                <li>Check browser console for detailed error information.</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Details modal */}
      <Modal
        show={showDetails}
        onHide={() => setShowDetails(false)}
        size="xl"
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>{hotelDetails?.name || "Hotel Details"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingDetails ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
            </div>
          ) : errorDetails ? (
            <div className="text-danger">{errorDetails}</div>
          ) : hotelDetails ? (
            <Tabs defaultActiveKey="overview" className="mb-3">
              <Tab eventKey="overview" title="Overview">
                <Row className="mt-3">
                  <Col md={6}>
                    {hotelDetails.primary_photo && (
                      <img
                        src={hotelDetails.primary_photo}
                        alt="Hotel"
                        className="img-fluid rounded mb-3"
                      />
                    )}
                    <h6>Basic Information</h6>
                    <ListGroup variant="flush">
                      <ListGroup.Item>
                        <strong>Hotel ID:</strong> {hotelDetails.hotel_id}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Name:</strong> {hotelDetails.name}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Former Name:</strong>{" "}
                        {hotelDetails.hotel_formerly_name || "N/A"}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Property Type:</strong>{" "}
                        {hotelDetails.property_type}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Star Rating:</strong> {hotelDetails.star_rating}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Chain:</strong> {hotelDetails.chain || "N/A"}
                      </ListGroup.Item>
                    </ListGroup>
                  </Col>
                  <Col md={6}>
                    <h6>Description</h6>
                    <p>
                      {hotelDetails.descriptions?.[0]?.text ||
                        "No description available."}
                    </p>

                    <h6 className="mt-4">Review Rating</h6>
                    <ListGroup variant="flush">
                      <ListGroup.Item>
                        <strong>Source:</strong>{" "}
                        {hotelDetails.review_rating?.source || "N/A"}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Number of Reviews:</strong>{" "}
                        {hotelDetails.review_rating?.number_of_reviews || "N/A"}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Average Rating:</strong>{" "}
                        {hotelDetails.review_rating?.rating_average || "N/A"}
                      </ListGroup.Item>
                    </ListGroup>
                  </Col>
                </Row>
              </Tab>
              <Tab eventKey="location" title="Location">
                <Row className="mt-3">
                  <Col md={6}>
                    <h6>Address</h6>
                    <ListGroup variant="flush">
                      <ListGroup.Item>
                        <strong>Full Address:</strong>{" "}
                        {hotelDetails.address?.full_address}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Address Line 1:</strong>{" "}
                        {hotelDetails.address?.address_line_1}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>City:</strong> {hotelDetails.address?.city}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>State:</strong> {hotelDetails.address?.state}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Country:</strong>{" "}
                        {hotelDetails.address?.country}
                      </ListGroup.Item>

                      <ListGroup.Item>
                        <strong>Country Code:</strong>{" "}
                        {hotelDetails.address?.country_code}
                      </ListGroup.Item>

                      <ListGroup.Item>
                        <strong>Postal Code:</strong>{" "}
                        {hotelDetails.address?.postal_code}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Coordinates:</strong>{" "}
                        {hotelDetails.address?.latitude},{" "}
                        {hotelDetails.address?.longitude}
                      </ListGroup.Item>
                    </ListGroup>
                  </Col>
                  <Col md={6}>
                    <h6>Nearby Locations</h6>
                    <ListGroup variant="flush">
                      <ListGroup.Item>
                        <strong>Nearest Airports:</strong>
                        <ul className="mb-0">
                          {hotelDetails.nearest_airports?.map(
                            (airport, idx) => (
                              <li key={idx}>
                                {airport.name} ({airport.code})
                              </li>
                            )
                          ) || <li>N/A</li>}
                        </ul>
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Train Stations:</strong>
                        <ul className="mb-0">
                          {hotelDetails.train_stations?.map((station, idx) => (
                            <li key={idx}>
                              {station.name || "N/A"}{" "}
                              {station.code && `(${station.code})`}
                            </li>
                          )) || <li>N/A</li>}
                        </ul>
                      </ListGroup.Item>
                    </ListGroup>
                  </Col>
                </Row>
              </Tab>

              <Tab eventKey="room" title="Room">
                <RoomTypesTab roomTypes={hotelDetails.room_type || []} />
              </Tab>

              {/* Images (uses hotel_photo array) */}
              <Tab eventKey="images" title="Images">
                <Row className="mt-3">
                  <Col>
                    <h6>Photos</h6>
                    {(hotelDetails.hotel_photo || []).length === 0 ? (
                      <div className="text-muted">No images available</div>
                    ) : (
                      <Row>
                        {(hotelDetails.hotel_photo || []).map((p, i) => (
                          <Col
                            key={p.picture_id ?? i}
                            xs={12}
                            sm={6}
                            md={4}
                            lg={3}
                            className="mb-3"
                          >
                            <Card
                              className="h-100"
                              style={{ cursor: p.url ? "pointer" : "default" }}
                            >
                              <div style={{ height: 140, overflow: "hidden" }}>
                                <img
                                  src={p.url}
                                  alt={p.title || `photo-${i}`}
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                  }}
                                  onError={(e) => {
                                    e.currentTarget.onerror = null;
                                    e.currentTarget.src =
                                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250'%3E%3Crect width='100%25' height='100%25' fill='%23e9ecef'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23777' font-family='Arial' font-size='16'%3EImage not available%3C/text%3E%3C/svg%3E";
                                  }}
                                />
                              </div>
                              <Card.Body className="p-2 d-flex justify-content-between align-items-center">
                                <small className="mb-0 text-truncate">
                                  {p.title || "No title"}
                                </small>
                                {p.url && (
                                  <Button
                                    size="sm"
                                    variant="outline-primary"
                                    href={p.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    Open
                                  </Button>
                                )}
                              </Card.Body>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    )}
                  </Col>
                </Row>
              </Tab>

              {/* Amenities & Facilities */}
              <Tab eventKey="amenities" title="Amenities / Facilities">
                <Row className="mt-3">
                  <Col md={6}>
                    <h6>Amenities</h6>
                    {(hotelDetails.amenities || []).length ? (
                      <ListGroup variant="flush">
                        {hotelDetails.amenities.map((a, idx) => (
                          <ListGroup.Item key={idx}>
                            {/* if you have icon class names, we render them */}
                            {a.icon ? (
                              <i className={`${a.icon} me-2`}></i>
                            ) : null}
                            {a.title || a.type || "—"}
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    ) : (
                      <div className="text-muted">No amenities information</div>
                    )}
                  </Col>

                  <Col md={6}>
                    <h6>Facilities</h6>
                    {(hotelDetails.facilities || []).length ? (
                      <ListGroup variant="flush">
                        {hotelDetails.facilities.map((f, idx) => (
                          <ListGroup.Item key={idx}>
                            {f.icon ? (
                              <i className={`${f.icon} me-2`}></i>
                            ) : null}
                            {f.title || f.type || "—"}
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    ) : (
                      <div className="text-muted">
                        No facilities information
                      </div>
                    )}
                  </Col>
                </Row>
              </Tab>

              {/* Points of Interest & other connected items */}
              <Tab eventKey="poi" title="Points & Connected">
                <Row className="mt-3">
                  <Col md={6}>
                    <h6>Points of Interest</h6>
                    {(hotelDetails.point_of_interests || []).length ? (
                      <ListGroup variant="flush">
                        {hotelDetails.point_of_interests.map((poi, idx) => (
                          <ListGroup.Item key={idx}>
                            {poi.name || poi.title || "Unknown"}{" "}
                            {poi.distance ? `— ${poi.distance}` : ""}
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    ) : (
                      <div className="text-muted">No points of interest</div>
                    )}
                  </Col>

                  <Col md={6}>
                    <h6>Other Connected Locations</h6>
                    <ListGroup variant="flush">
                      <ListGroup.Item>
                        <strong>Connected Locations:</strong>
                        <ul className="mb-0">
                          {(hotelDetails.connected_locations || []).length ? (
                            hotelDetails.connected_locations.map((c, idx) => (
                              <li key={idx}>{c.name || c.code || "N/A"}</li>
                            ))
                          ) : (
                            <li>N/A</li>
                          )}
                        </ul>
                      </ListGroup.Item>

                      <ListGroup.Item>
                        <strong>Stadiums:</strong>
                        <ul className="mb-0">
                          {(hotelDetails.stadiums || []).length ? (
                            hotelDetails.stadiums.map((s, idx) => (
                              <li key={idx}>{s.name || s.code || "N/A"}</li>
                            ))
                          ) : (
                            <li>N/A</li>
                          )}
                        </ul>
                      </ListGroup.Item>
                    </ListGroup>
                  </Col>
                </Row>
              </Tab>

              <Tab eventKey="contact" title="Contact">
                <Row className="mt-3">
                  <Col md={6}>
                    <h6>Contact Information</h6>
                    <ListGroup variant="flush">
                      <ListGroup.Item>
                        <strong>Phone Numbers:</strong>
                        <ul className="mb-0">
                          {hotelDetails.contacts?.phone_numbers?.map(
                            (phone, idx) => <li key={idx}>{phone}</li>
                          ) || <li>N/A</li>}
                        </ul>
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Email Addresses:</strong>
                        <ul className="mb-0">
                          {hotelDetails.contacts?.email_address?.map(
                            (email, idx) => <li key={idx}>{email}</li>
                          ) || <li>N/A</li>}
                        </ul>
                      </ListGroup.Item>
                    </ListGroup>
                  </Col>
                  <Col md={6}>
                    <h6>Additional Information</h6>
                    <ListGroup variant="flush">
                      <ListGroup.Item>
                        <strong>Fax:</strong>
                        <ul className="mb-0">
                          {hotelDetails.contacts?.fax?.map((fax, idx) => (
                            <li key={idx}>{fax}</li>
                          )) || <li>N/A</li>}
                        </ul>
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Website:</strong>
                        <ul className="mb-0">
                          {hotelDetails.contacts?.website?.map((site, idx) => (
                            <li key={idx}>{site || "N/A"}</li>
                          )) || <li>N/A</li>}
                        </ul>
                      </ListGroup.Item>
                    </ListGroup>
                  </Col>
                </Row>
              </Tab>
              <Tab eventKey="policies" title="Policies">
                <Row className="mt-3">
                  <Col md={6}>
                    <h6>Check-in/Check-out</h6>
                    <ListGroup variant="flush">
                      <ListGroup.Item>
                        <strong>Check-in:</strong>{" "}
                        {hotelDetails.policies?.checkin?.begin_time} to{" "}
                        {hotelDetails.policies?.checkin?.end_time}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Check-out:</strong>{" "}
                        {hotelDetails.policies?.checkout?.time}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Instructions:</strong>{" "}
                        {hotelDetails.policies?.checkin?.instructions || "N/A"}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Minimum Age:</strong>{" "}
                        {hotelDetails.policies?.checkin?.min_age || "N/A"}
                      </ListGroup.Item>
                    </ListGroup>
                  </Col>
                  <Col md={6}>
                    <h6>Other Policies</h6>
                    <ListGroup variant="flush">
                      <ListGroup.Item>
                        <strong>Pets:</strong>{" "}
                        {hotelDetails.policies?.pets
                          ? "Allowed"
                          : "Not allowed"}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Fees:</strong>{" "}
                        {hotelDetails.policies?.fees?.optional || "N/A"}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Know Before You Go:</strong>{" "}
                        {hotelDetails.policies?.know_before_you_go || "N/A"}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Remarks:</strong>{" "}
                        {hotelDetails.policies?.remark || "N/A"}
                      </ListGroup.Item>
                    </ListGroup>
                  </Col>
                </Row>
              </Tab>
            </Tabs>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetails(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>



    </Container>
              <footer className="text-center text-muted mt-auto py-3 bg-light">
        <small>© {new Date().getFullYear()} Hotel Mapping API</small>
      </footer>
        
         </div>
  );
}



