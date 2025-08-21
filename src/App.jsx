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
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const timerRef = useRef(null);

  const [checkSupplier, setCheckSupplier] = useState("hotelbeds");
  const [checkHotelId, setCheckHotelId] = useState("");
  const [checkLoading, setCheckLoading] = useState(false);
  const [checkResult, setCheckResult] = useState(null);
  const [checkError, setCheckError] = useState(null);

  const [showDetails, setShowDetails] = useState(false);
  const [hotelDetails, setHotelDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  // Timer state & refs
  const [elapsedMs, setElapsedMs] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);

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
    { id: "roomerang", name: "RoomeRang" },
    { id: "stuba", name: "Stuba" },
  ];


  //   const supplierOptionsCollectData = [
  //   { id: "hotelbeds", name: "Hotelbeds" },
  //   { id: "tbohotel", name: "TBO Hotels" },
  //   { id: "agoda", name: "Agoda" },
  //   { id: "ean", name: "Expedia" },
  //   { id: "grnconnect", name: "GRN Connect" },
  //   { id: "restel", name: "Restel" },
  //   { id: "dotw", name: "DOTW" },
  //   { id: "paximum", name: "Paximum" },
  //   { id: "amadeushotel", name: "Amadeus Hotel" },
  //   { id: "goglobal", name: "GoGlobal" },
  //   { id: "hyperguestdirect", name: "HyperGuest Direct" },
  //   { id: "innstant", name: "Innstant" },
  //   { id: "rakuten", name: "Rakuten" },
  // ];


  const parseHotelInput = (text) =>
    (text || "")
      .split(/[,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

  // format ms to HH:MM:SS or MM:SS
  const formatDuration = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n) => n.toString().padStart(2, "0");
    return hours > 0
      ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(minutes)}:${pad(seconds)}`;
  };

  // Start timer
  const startTimer = () => {
    startTimeRef.current = Date.now();
    setElapsedMs(0);
    setTimerRunning(true);
    // update 4 times/sec for smoother UI
    intervalRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current);
    }, 250);
  };

  // Stop timer
  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (startTimeRef.current) {
      setElapsedMs(Date.now() - startTimeRef.current);
    }
    setTimerRunning(false);
  };

  // SUBMIT bulk
  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    const ids = parseHotelInput(hotelIds);
    if (!ids.length) return setError("Please enter at least one hotel ID.");
    setError(null);

    // start UI timer and loading
    startTimer();
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
      // stop timer when processing finishes
      stopTimer();
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

  // cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);




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
      const ids = parseHotelInput(
        text.replace(/\r/g, "\n").replace(/,+/g, ",")
      );
      setHotelIds((prev) =>
        prev ? prev + "\n" + ids.join(",") : ids.join(",")
      );
    };
    reader.readAsText(file);
  };

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // helpers for UI
  const total = results.length;
  const successCount = results.filter((r) => r.status === "saved").length;
  const failedCount = results.filter((r) => r.status === "failed").length;
  const progressPercent = total ? Math.round((successCount / total) * 100) : 0;

  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{ backgroundColor: "#f8f9fa" }}
    >
      {/* Header */}
      <header className="bg-white shadow-sm py-3">
        <Container>
          <Row className="align-items-center">
            <Col>
              <h3 className="mb-0 text-primary">
                <i className="fas fa-hotel me-2"></i>
                Hotel Mapping Dashboard
              </h3>
              <small className="text-muted">
                Manage hotel IDs across multiple suppliers
              </small>
            </Col>
            <Col xs="auto">
              <Badge bg="light" text="dark" className="fs-6">
                v2.0
              </Badge>
            </Col>
          </Row>
        </Container>
      </header>

      <Container className="py-4 flex-grow-1">
        <Row className="gy-4">
          {/* Main Content */}
          <Col lg={8}>
            {/* Quick Check Card */}
            <Card className="shadow border-0 mb-4">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-primary p-2 rounded me-3">
                    <i className="fas fa-search text-white"></i>
                  </div>
                  <div>
                    <h5 className="mb-0">Quick Availability Check</h5>
                    <small className="text-muted">
                      Verify a single hotel ID
                    </small>
                  </div>
                </div>

                <Row className="g-2 align-items-end">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold">
                        Supplier
                      </Form.Label>
                      <Form.Select
                        value={checkSupplier}
                        onChange={(e) => setCheckSupplier(e.target.value)}
                        size="sm"
                      >
                        {supplierOptions.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="small fw-semibold">
                        Hotel ID
                      </Form.Label>
                      <Form.Control
                        placeholder="Enter hotel ID"
                        value={checkHotelId}
                        onChange={(e) => setCheckHotelId(e.target.value)}
                        size="sm"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={4} className="d-flex gap-2">
                    <Button
                      variant="primary"
                      onClick={handleTopCheckAvailability}
                      disabled={checkLoading}
                      size="sm"
                      className="flex-fill"
                    >
                      {checkLoading ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <>
                          <i className="fas fa-search me-1"></i> Check
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline-secondary"
                      onClick={() => {
                        setCheckHotelId("");
                        setCheckResult(null);
                        setCheckError(null);
                      }}
                      size="sm"
                    >
                      <i className="fas fa-times"></i>
                    </Button>
                  </Col>
                </Row>

                {checkError && (
                  <Alert variant="danger" className="mt-3 mb-0 py-2">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {checkError}
                  </Alert>
                )}

                {checkResult && (
                  <Card className="mt-3 bg-light border">
                    <Card.Body className="p-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">
                            {checkResult.name || "Unnamed Hotel"}
                          </h6>
                          <div className="text-muted small">
                            <i className="fas fa-map-marker-alt me-1"></i>
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
                            <i className="fas fa-eye me-1"></i> View
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                )}
              </Card.Body>
            </Card>

            {/* Prominent timer display above Bulk Push card */}
            <div className="mb-3 text-center">
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                }}
              >
                ⏱{" "}
                {timerRunning
                  ? formatDuration(elapsedMs)
                  : elapsedMs
                  ? formatDuration(elapsedMs)
                  : "00:00"}
              </div>
              <div className="small text-muted">
                {timerRunning
                  ? "Push in progress..."
                  : elapsedMs
                  ? "Last push duration"
                  : "No push yet"}
              </div>
            </div>

            {/* Bulk Processing Card */}
            <Card className="shadow border-0 mb-4">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-success p-2 rounded me-3">
                    <i className="fas fa-bolt text-white"></i>
                  </div>
                  <div>
                    <h5 className="mb-0">Bulk Hotel Processing</h5>
                    <small className="text-muted">
                      Process multiple hotel IDs at once
                    </small>
                  </div>
                </div>

                <Form onSubmit={handleSubmit}>
                  <Row className="g-3 mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small fw-semibold">
                          Supplier
                        </Form.Label>
                        <Form.Select
                          value={supplier}
                          onChange={(e) => setSupplier(e.target.value)}
                          size="sm"
                        >
                          {supplierOptions.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={6} className="d-flex gap-2 align-items-end">
                      <Button
                        variant="outline-secondary"
                        onClick={() => setHotelIds("")}
                        disabled={loading}
                        size="sm"
                      >
                        <i className="fas fa-eraser me-1"></i> Clear
                      </Button>

                      <Button
                        variant="success"
                        type="submit"
                        disabled={loading || !hotelIds.trim()}
                        size="sm"
                        className="position-relative flex-grow-1"
                      >
                        {loading ? (
                          <>
                            <Spinner
                              animation="border"
                              size="sm"
                              className="me-2"
                            />
                            Processing...
                            {timerActive && (
                              <span
                                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-info"
                                style={{ fontSize: "0.6rem" }}
                              >
                                {formatTime(elapsedTime)}
                              </span>
                            )}
                          </>
                        ) : (
                          <>
                            <i className="fas fa-play-circle me-1"></i> Process
                            Hotels
                          </>
                        )}
                      </Button>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-semibold">
                      Hotel IDs (comma or newline separated)
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="ms-2"
                        onClick={() =>
                          document.getElementById("fileUpload").click()
                        }
                      >
                        <i className="fas fa-upload me-1"></i> Upload File
                      </Button>
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
                      className="border-0 bg-light"
                    />
                    <div className="text-muted small mt-1">
                      <i className="fas fa-lightbulb me-1"></i>
                      Tip: Use Ctrl/Cmd + Enter to submit.
                    </div>
                  </Form.Group>

                  {error && (
                    <Alert variant="danger" className="mb-0 py-2">
                      <i className="fas fa-exclamation-circle me-2"></i>
                      {error}
                    </Alert>
                  )}
                </Form>
              </Card.Body>
            </Card>

            {/* Results Card */}
            <Card className="shadow border-0">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center">
                    <div className="bg-info p-2 rounded me-3">
                      <i className="fas fa-list text-white"></i>
                    </div>
                    <div>
                      <h5 className="mb-0">Processing Results</h5>
                      <small className="text-muted">
                        {total} items • {successCount} saved • {failedCount}{" "}
                        failed
                      </small>
                    </div>
                  </div>

                  <div style={{ width: 220 }}>
                    <ProgressBar
                      now={progressPercent}
                      label={`${progressPercent}%`}
                      variant={progressPercent === 100 ? "success" : "primary"}
                      className="fw-bold"
                    />
                  </div>
                </div>

                <div style={{ maxHeight: 340, overflow: "auto" }}>
                  <Table hover className="mb-0">
                    <thead className="table-light">
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
                            <td className="fw-medium font-monospace">
                              {r.hotel_id}
                            </td>
                            <td>
                              {r.status === "saved" ? (
                                <Badge bg="success" className="px-2 py-1">
                                  <i className="fas fa-check me-1"></i>
                                  {r.status.toUpperCase()}
                                </Badge>
                              ) : (
                                <Badge bg="danger" className="px-2 py-1">
                                  <i className="fas fa-times me-1"></i>
                                  {(r.status || "failed").toUpperCase()}
                                </Badge>
                              )}
                            </td>
                            <td style={{ maxWidth: 300 }}>
                              {r.status === "saved" ? (
                                <div className="text-success small">
                                  <i className="fas fa-check-circle me-1"></i>
                                  Successfully saved
                                </div>
                              ) : (
                                <div className="text-danger small">
                                  <i className="fas fa-exclamation-triangle me-1"></i>
                                  {r.reason || "Error processing"}
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
                                  <i className="fas fa-info-circle me-1"></i>{" "}
                                  Details
                                </Button>
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  onClick={() =>
                                    navigator.clipboard?.writeText(r.hotel_id)
                                  }
                                >
                                  <i className="fas fa-copy me-1"></i> Copy
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="text-center text-muted py-4"
                          >
                            <i className="fas fa-inbox fa-2x mb-2 d-block"></i>
                            No results yet — process hotels to see results here.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Sidebar */}
          <Col lg={4}>
            {/* Stats Card */}
            <Card className="shadow border-0 mb-4">
              <Card.Body className="p-4">
                <h6 className="border-bottom pb-2 mb-3">
                  <i className="fas fa-chart-bar me-2"></i>
                  Processing Summary
                </h6>

                <ListGroup variant="flush" className="mt-2">
                  <ListGroup.Item className="d-flex justify-content-between align-items-center px-0">
                    <span>Total Processed</span>
                    <Badge bg="primary" pill>
                      {total}
                    </Badge>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between align-items-center px-0">
                    <span className="text-success">Successfully Saved</span>
                    <Badge bg="success" pill>
                      {successCount}
                    </Badge>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between align-items-center px-0">
                    <span className="text-danger">Failed</span>
                    <Badge bg="danger" pill>
                      {failedCount}
                    </Badge>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between align-items-center px-0">
                    <span>Success Rate</span>
                    <Badge bg="info" pill>
                      {total ? Math.round((successCount / total) * 100) : 0}%
                    </Badge>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    Last push time:{" "}
                    <strong style={{ fontFamily: "monospace" }}>
                      {elapsedMs ? formatDuration(elapsedMs) : "—"}
                    </strong>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>

            {/* Quick Actions Card */}
            <Card className="shadow border-0 mb-4">
              <Card.Body className="p-4">
                <h6 className="border-bottom pb-2 mb-3">
                  <i className="fas fa-bolt me-2"></i>
                  Quick Actions
                </h6>

                <div className="d-grid gap-2">
                  <Button
                    variant="outline-primary"
                    onClick={() => setHotelIds("")}
                    size="sm"
                  >
                    <i className="fas fa-eraser me-2"></i> Clear Input
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => setResults([])}
                    size="sm"
                  >
                    <i className="fas fa-trash me-2"></i> Clear Results
                  </Button>
                  <Button
                    variant="outline-info"
                    onClick={() => setHotelIds("754387,133836,23418915,164")}
                    size="sm"
                  >
                    <i className="fas fa-download me-2"></i> Load Demo IDs
                  </Button>
                </div>
              </Card.Body>
            </Card>

            {/* Tips Card */}
            <Card className="shadow border-0">
              <Card.Body className="p-4">
                <h6 className="border-bottom pb-2 mb-3">
                  <i className="fas fa-lightbulb me-2"></i>
                  Tips & Best Practices
                </h6>

                <div className="small">
                  <div className="d-flex mb-2">
                    <div className="me-3 text-primary">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <div>Use comma or newline to separate IDs</div>
                  </div>
                  <div className="d-flex mb-2">
                    <div className="me-3 text-primary">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <div>Check a single hotel before bulk processing</div>
                  </div>
                  <div className="d-flex mb-2">
                    <div className="me-3 text-primary">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <div>
                      Check browser console for detailed error information
                    </div>
                  </div>
                  <div className="d-flex">
                    <div className="me-3 text-primary">
                      <i className="fas fa-check-circle"></i>
                    </div>
                    <div>
                      Use the upload feature for large lists of hotel IDs
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Footer */}
      <footer className="bg-dark text-light py-4 mt-5">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <h5 className="mb-1">
                <i className="fas fa-hotel me-2"></i>
                Hotel Mapping System
              </h5>
              <small className="text-muted">
                Streamlined hotel management across multiple suppliers.
              </small>
            </Col>
            <Col md={6} className="text-md-end mt-2 mt-md-0">
              <small>
                © {new Date().getFullYear()} Hotel Mapping API • v2.0
              </small>
            </Col>
          </Row>
        </Container>
      </footer>

      {/* Details modal */}
      <Modal
        show={showDetails}
        onHide={() => setShowDetails(false)}
        size="xl"
        scrollable
        centered
        className="hotel-details-modal"
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>
            <i className="fas fa-hotel me-2 text-primary"></i>
            {hotelDetails?.name || "Hotel Details"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {loadingDetails ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" className="mb-3" />
              <h5>Loading hotel details...</h5>
            </div>
          ) : errorDetails ? (
            <Alert variant="danger" className="m-4">
              <i className="fas fa-exclamation-circle me-2"></i>
              {errorDetails}
            </Alert>
          ) : hotelDetails ? (
            <Tabs defaultActiveKey="overview" className="mb-0">
              <Tab
                eventKey="overview"
                title={
                  <>
                    <i className="fas fa-info-circle me-1"></i> Overview
                  </>
                }
              >
                <div className="p-4">
                  <Row>
                    <Col md={6}>
                      {hotelDetails.primary_photo && (
                        <div className="mb-4">
                          <img
                            src={hotelDetails.primary_photo}
                            alt="Hotel"
                            className="img-fluid rounded shadow-sm"
                            style={{
                              width: "100%",
                              height: "250px",
                              objectFit: "cover",
                            }}
                          />
                        </div>
                      )}

                      <Card className="shadow-sm border-0">
                        <Card.Header className="bg-primary text-white">
                          <h6 className="mb-0">
                            <i className="fas fa-info-circle me-1"></i> Basic
                            Information
                          </h6>
                        </Card.Header>
                        <ListGroup variant="flush">
                          <ListGroup.Item className="d-flex justify-content-between">
                            <span className="fw-medium">Hotel ID:</span>
                            <Badge bg="secondary">
                              {hotelDetails.hotel_id}
                            </Badge>
                          </ListGroup.Item>
                          <ListGroup.Item className="d-flex justify-content-between">
                            <span className="fw-medium">Name:</span>
                            <span>{hotelDetails.name}</span>
                          </ListGroup.Item>
                          <ListGroup.Item className="d-flex justify-content-between">
                            <span className="fw-medium">Former Name:</span>
                            <span>
                              {hotelDetails.hotel_formerly_name || "N/A"}
                            </span>
                          </ListGroup.Item>
                          <ListGroup.Item className="d-flex justify-content-between">
                            <span className="fw-medium">Property Type:</span>
                            <span>{hotelDetails.property_type}</span>
                          </ListGroup.Item>
                          <ListGroup.Item className="d-flex justify-content-between">
                            <span className="fw-medium">Star Rating:</span>
                            <div>
                              {Array.from({ length: 5 }).map((_, i) => (
                                <i
                                  key={i}
                                  className={`fas fa-star${
                                    i < hotelDetails.star_rating
                                      ? " text-warning"
                                      : " text-muted"
                                  }`}
                                ></i>
                              ))}
                            </div>
                          </ListGroup.Item>
                          <ListGroup.Item className="d-flex justify-content-between">
                            <span className="fw-medium">Chain:</span>
                            <span>{hotelDetails.chain || "N/A"}</span>
                          </ListGroup.Item>
                        </ListGroup>
                      </Card>
                    </Col>

                    <Col md={6}>
                      <Card className="shadow-sm border-0 mb-4">
                        <Card.Header className="bg-info text-white">
                          <h6 className="mb-0">
                            <i className="fas fa-align-left me-1"></i>{" "}
                            Description
                          </h6>
                        </Card.Header>
                        <Card.Body>
                          <p className="mb-0">
                            {hotelDetails.descriptions?.[0]?.text ||
                              "No description available."}
                          </p>
                        </Card.Body>
                      </Card>

                      <Card className="shadow-sm border-0">
                        <Card.Header className="bg-success text-white">
                          <h6 className="mb-0">
                            <i className="fas fa-star me-1"></i> Review Rating
                          </h6>
                        </Card.Header>
                        <ListGroup variant="flush">
                          <ListGroup.Item className="d-flex justify-content-between">
                            <span className="fw-medium">Source:</span>
                            <span>
                              {hotelDetails.review_rating?.source || "N/A"}
                            </span>
                          </ListGroup.Item>
                          <ListGroup.Item className="d-flex justify-content-between">
                            <span className="fw-medium">
                              Number of Reviews:
                            </span>
                            <Badge bg="primary">
                              {hotelDetails.review_rating?.number_of_reviews ||
                                "N/A"}
                            </Badge>
                          </ListGroup.Item>
                          <ListGroup.Item className="d-flex justify-content-between">
                            <span className="fw-medium">Average Rating:</span>
                            <Badge bg="warning" text="dark">
                              {hotelDetails.review_rating?.rating_average ||
                                "N/A"}
                            </Badge>
                          </ListGroup.Item>
                        </ListGroup>
                      </Card>
                    </Col>
                  </Row>
                </div>
              </Tab>

              <Tab
                eventKey="location"
                title={
                  <>
                    <i className="fas fa-map-marker-alt me-1"></i> Location
                  </>
                }
              >
                <div className="p-4">
                  <Row>
                    <Col md={6}>
                      <Card className="shadow-sm border-0 mb-4">
                        <Card.Header className="bg-primary text-white">
                          <h6 className="mb-0">
                            <i className="fas fa-address-card me-1"></i> Address
                          </h6>
                        </Card.Header>
                        <ListGroup variant="flush">
                          <ListGroup.Item>
                            <i className="fas fa-map text-muted me-2"></i>
                            <span className="fw-medium">
                              Full Address:
                            </span>{" "}
                            {hotelDetails.address?.full_address}
                          </ListGroup.Item>
                          <ListGroup.Item>
                            <i className="fas fa-road text-muted me-2"></i>
                            <span className="fw-medium">
                              Address Line 1:
                            </span>{" "}
                            {hotelDetails.address?.address_line_1}
                          </ListGroup.Item>
                          <ListGroup.Item>
                            <i className="fas fa-city text-muted me-2"></i>
                            <span className="fw-medium">City:</span>{" "}
                            {hotelDetails.address?.city}
                          </ListGroup.Item>
                          <ListGroup.Item>
                            <i className="fas fa-flag text-muted me-2"></i>
                            <span className="fw-medium">State:</span>{" "}
                            {hotelDetails.address?.state}
                          </ListGroup.Item>
                          <ListGroup.Item>
                            <i className="fas fa-globe text-muted me-2"></i>
                            <span className="fw-medium">Country:</span>{" "}
                            {hotelDetails.address?.country}
                          </ListGroup.Item>
                          <ListGroup.Item>
                            <i className="fas fa-flag text-muted me-2"></i>
                            <span className="fw-medium">
                              Country Code:
                            </span>{" "}
                            {hotelDetails.address?.country_code}
                          </ListGroup.Item>
                          <ListGroup.Item>
                            <i className="fas fa-envelope text-muted me-2"></i>
                            <span className="fw-medium">Postal Code:</span>{" "}
                            {hotelDetails.address?.postal_code}
                          </ListGroup.Item>
                          <ListGroup.Item>
                            <i className="fas fa-location-dot text-muted me-2"></i>
                            <span className="fw-medium">Coordinates:</span>{" "}
                            {hotelDetails.address?.latitude},{" "}
                            {hotelDetails.address?.longitude}
                          </ListGroup.Item>
                        </ListGroup>
                      </Card>
                    </Col>

                    <Col md={6}>
                      <Card className="shadow-sm border-0">
                        <Card.Header className="bg-info text-white">
                          <h6 className="mb-0">
                            <i className="fas fa-location-crosshairs me-1"></i>{" "}
                            Nearby Locations
                          </h6>
                        </Card.Header>
                        <ListGroup variant="flush">
                          <ListGroup.Item>
                            <div className="fw-medium mb-2">
                              <i className="fas fa-plane-departure me-2"></i>{" "}
                              Nearest Airports:
                            </div>
                            <div className="ms-4">
                              {hotelDetails.nearest_airports?.length > 0 ? (
                                hotelDetails.nearest_airports.map(
                                  (airport, idx) => (
                                    <div
                                      key={idx}
                                      className="d-flex justify-content-between mb-1"
                                    >
                                      <span>
                                        {airport.name} ({airport.code})
                                      </span>
                                      {airport.distance && (
                                        <Badge bg="secondary">
                                          {airport.distance}
                                        </Badge>
                                      )}
                                    </div>
                                  )
                                )
                              ) : (
                                <div className="text-muted">N/A</div>
                              )}
                            </div>
                          </ListGroup.Item>

                          <ListGroup.Item>
                            <div className="fw-medium mb-2">
                              <i className="fas fa-train me-2"></i> Train
                              Stations:
                            </div>
                            <div className="ms-4">
                              {hotelDetails.train_stations?.length > 0 ? (
                                hotelDetails.train_stations.map(
                                  (station, idx) => (
                                    <div
                                      key={idx}
                                      className="d-flex justify-content-between mb-1"
                                    >
                                      <span>{station.name || "N/A"}</span>
                                      {station.code && (
                                        <Badge bg="secondary">
                                          {station.code}
                                        </Badge>
                                      )}
                                    </div>
                                  )
                                )
                              ) : (
                                <div className="text-muted">N/A</div>
                              )}
                            </div>
                          </ListGroup.Item>
                        </ListGroup>
                      </Card>
                    </Col>
                  </Row>
                </div>
              </Tab>

              <Tab
                eventKey="room"
                title={
                  <>
                    <i className="fas fa-bed me-1"></i> Room Types
                  </>
                }
              >
                <div className="p-4">
                  <RoomTypesTab roomTypes={hotelDetails.room_type || []} />
                </div>
              </Tab>

              {/* Images (uses hotel_photo array) */}
              <Tab
                eventKey="images"
                title={
                  <>
                    <i className="fas fa-images me-1"></i> Images
                  </>
                }
              >
                <div className="p-4">
                  <h5 className="mb-3">
                    <i className="fas fa-images me-2"></i> Hotel Photos
                  </h5>
                  {(hotelDetails.hotel_photo || []).length === 0 ? (
                    <div className="text-center text-muted py-5">
                      <i className="fas fa-image fa-3x mb-3"></i>
                      <p>No images available</p>
                    </div>
                  ) : (
                    <Row>
                      {(hotelDetails.hotel_photo || []).map((p, i) => (
                        <Col
                          key={p.picture_id ?? i}
                          xs={12}
                          sm={6}
                          md={4}
                          lg={3}
                          className="mb-4"
                        >
                          <Card className="h-100 shadow-sm border-0">
                            <div
                              className="position-relative"
                              style={{
                                height: 180,
                                overflow: "hidden",
                                cursor: p.url ? "pointer" : "default",
                              }}
                            >
                              <img
                                src={p.url}
                                alt={p.title || `photo-${i}`}
                                className="img-fluid"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src =
                                    "https://hoteljson.innsightmap.com/test1/no_room_found.png";
                                }}
                              />
                              {p.title && (
                                <div
                                  className="position-absolute bottom-0 start-0 end-0 p-2 text-white"
                                  style={{
                                    background:
                                      "linear-gradient(transparent, rgba(0,0,0,0.7))",
                                  }}
                                >
                                  <small className="text-truncate d-block">
                                    {p.title}
                                  </small>
                                </div>
                              )}
                            </div>
                            <Card.Body className="p-3 d-flex justify-content-between align-items-center">
                              <small className="text-muted text-truncate">
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
                                  <i className="fas fa-external-link-alt"></i>
                                </Button>
                              )}
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  )}
                </div>
              </Tab>

              {/* Amenities & Facilities */}
              <Tab
                eventKey="amenities"
                title={
                  <>
                    <i className="fas fa-umbrella-beach me-1"></i> Amenities
                  </>
                }
              >
                <div className="p-4">
                  <Row>
                    <Col md={6}>
                      <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-success text-white">
                          <h6 className="mb-0">
                            <i className="fas fa-spa me-1"></i> Amenities
                          </h6>
                        </Card.Header>
                        <Card.Body>
                          {(hotelDetails.amenities || []).length ? (
                            <div className="amenities-grid">
                              {hotelDetails.amenities.map((a, idx) => (
                                <div
                                  key={idx}
                                  className="d-flex align-items-center mb-2 p-2 bg-light rounded"
                                >
                                  {a.icon ? (
                                    <i
                                      className={`${a.icon} text-primary me-2`}
                                    ></i>
                                  ) : (
                                    <i className="fas fa-check-circle text-success me-2"></i>
                                  )}
                                  <span>{a.title || a.type || "—"}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center text-muted py-4">
                              <i className="fas fa-ban fa-2x mb-2"></i>
                              <p>No amenities information</p>
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col md={6}>
                      <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-info text-white">
                          <h6 className="mb-0">
                            <i className="fas fa-concierge-bell me-1"></i>{" "}
                            Facilities
                          </h6>
                        </Card.Header>
                        <Card.Body>
                          {(hotelDetails.facilities || []).length ? (
                            <div className="amenities-grid">
                              {hotelDetails.facilities.map((f, idx) => (
                                <div
                                  key={idx}
                                  className="d-flex align-items-center mb-2 p-2 bg-light rounded"
                                >
                                  {f.icon ? (
                                    <i
                                      className={`${f.icon} text-primary me-2`}
                                    ></i>
                                  ) : (
                                    <i className="fas fa-check-circle text-success me-2"></i>
                                  )}
                                  <span>{f.title || f.type || "—"}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center text-muted py-4">
                              <i className="fas fa-ban fa-2x mb-2"></i>
                              <p>No facilities information</p>
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </div>
              </Tab>

              {/* Points of Interest & other connected items */}
              <Tab
                eventKey="poi"
                title={
                  <>
                    <i className="fas fa-map-pin me-1"></i> Points of Interest
                  </>
                }
              >
                <div className="p-4">
                  <Row>
                    <Col md={6}>
                      <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-primary text-white">
                          <h6 className="mb-0">
                            <i className="fas fa-location-dot me-1"></i> Points
                            of Interest
                          </h6>
                        </Card.Header>
                        <Card.Body>
                          {(hotelDetails.point_of_interests || []).length ? (
                            <ListGroup variant="flush">
                              {hotelDetails.point_of_interests.map(
                                (poi, idx) => (
                                  <ListGroup.Item
                                    key={idx}
                                    className="d-flex justify-content-between align-items-center"
                                  >
                                    <div>
                                      <i className="fas fa-map-marker-alt text-danger me-2"></i>
                                      {poi.name || poi.title || "Unknown"}
                                    </div>
                                    {poi.distance && (
                                      <Badge bg="secondary">
                                        {poi.distance}
                                      </Badge>
                                    )}
                                  </ListGroup.Item>
                                )
                              )}
                            </ListGroup>
                          ) : (
                            <div className="text-center text-muted py-4">
                              <i className="fas fa-map-marker-alt fa-2x mb-2"></i>
                              <p>No points of interest</p>
                            </div>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col md={6}>
                      <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-info text-white">
                          <h6 className="mb-0">
                            <i className="fas fa-location-crosshairs me-1"></i>{" "}
                            Other Connected Locations
                          </h6>
                        </Card.Header>
                        <Card.Body>
                          <h6 className="mb-3">
                            <i className="fas fa-link me-2"></i> Connected
                            Locations
                          </h6>
                          <div className="mb-4">
                            {(hotelDetails.connected_locations || []).length ? (
                              <ListGroup variant="flush">
                                {hotelDetails.connected_locations.map(
                                  (c, idx) => (
                                    <ListGroup.Item key={idx}>
                                      <i className="fas fa-location-dot text-primary me-2"></i>
                                      {c.name || c.code || "N/A"}
                                    </ListGroup.Item>
                                  )
                                )}
                              </ListGroup>
                            ) : (
                              <div className="text-muted">N/A</div>
                            )}
                          </div>

                          <h6 className="mb-3">
                            <i className="fas fa-volleyball me-2"></i> Stadiums
                          </h6>
                          <div>
                            {(hotelDetails.stadiums || []).length ? (
                              <ListGroup variant="flush">
                                {hotelDetails.stadiums.map((s, idx) => (
                                  <ListGroup.Item key={idx}>
                                    <i className="fas fa-stadium text-warning me-2"></i>
                                    {s.name || s.code || "N/A"}
                                  </ListGroup.Item>
                                ))}
                              </ListGroup>
                            ) : (
                              <div className="text-muted">N/A</div>
                            )}
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </div>
              </Tab>

              <Tab
                eventKey="contact"
                title={
                  <>
                    <i className="fas fa-address-book me-1"></i> Contact
                  </>
                }
              >
                <div className="p-4">
                  <Row>
                    <Col md={6}>
                      <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-success text-white">
                          <h6 className="mb-0">
                            <i className="fas fa-phone me-1"></i> Contact
                            Information
                          </h6>
                        </Card.Header>
                        <Card.Body>
                          <h6 className="mb-3">
                            <i className="fas fa-phone me-2"></i> Phone Numbers
                          </h6>
                          {(hotelDetails.contacts?.phone_numbers || [])
                            .length ? (
                            <ListGroup variant="flush" className="mb-4">
                              {hotelDetails.contacts.phone_numbers.map(
                                (phone, idx) => (
                                  <ListGroup.Item key={idx}>
                                    <i className="fas fa-phone text-success me-2"></i>
                                    {phone}
                                  </ListGroup.Item>
                                )
                              )}
                            </ListGroup>
                          ) : (
                            <div className="text-muted mb-4">N/A</div>
                          )}

                          <h6 className="mb-3">
                            <i className="fas fa-envelope me-2"></i> Email
                            Addresses
                          </h6>
                          {(hotelDetails.contacts?.email_address || [])
                            .length ? (
                            <ListGroup variant="flush">
                              {hotelDetails.contacts.email_address.map(
                                (email, idx) => (
                                  <ListGroup.Item key={idx}>
                                    <i className="fas fa-envelope text-primary me-2"></i>
                                    {email}
                                  </ListGroup.Item>
                                )
                              )}
                            </ListGroup>
                          ) : (
                            <div className="text-muted">N/A</div>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col md={6}>
                      <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-info text-white">
                          <h6 className="mb-0">
                            <i className="fas fa-globe me-1"></i> Additional
                            Information
                          </h6>
                        </Card.Header>
                        <Card.Body>
                          <h6 className="mb-3">
                            <i className="fas fa-fax me-2"></i> Fax
                          </h6>
                          {(hotelDetails.contacts?.fax || []).length ? (
                            <ListGroup variant="flush" className="mb-4">
                              {hotelDetails.contacts.fax.map((fax, idx) => (
                                <ListGroup.Item key={idx}>
                                  <i className="fas fa-fax text-secondary me-2"></i>
                                  {fax}
                                </ListGroup.Item>
                              ))}
                            </ListGroup>
                          ) : (
                            <div className="text-muted mb-4">N/A</div>
                          )}

                          <h6 className="mb-3">
                            <i className="fas fa-globe me-2"></i> Website
                          </h6>
                          {(hotelDetails.contacts?.website || []).length ? (
                            <ListGroup variant="flush">
                              {hotelDetails.contacts.website.map(
                                (site, idx) => (
                                  <ListGroup.Item key={idx}>
                                    <i className="fas fa-link text-info me-2"></i>
                                    {site ? (
                                      <a
                                        href={site}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        {site}
                                      </a>
                                    ) : (
                                      "N/A"
                                    )}
                                  </ListGroup.Item>
                                )
                              )}
                            </ListGroup>
                          ) : (
                            <div className="text-muted">N/A</div>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </div>
              </Tab>

              <Tab
                eventKey="policies"
                title={
                  <>
                    <i className="fas fa-clipboard-list me-1"></i> Policies
                  </>
                }
              >
                <div className="p-4">
                  <Row>
                    <Col md={6}>
                      <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-primary text-white">
                          <h6 className="mb-0">
                            <i className="fas fa-sign-in-alt me-1"></i>{" "}
                            Check-in/Check-out
                          </h6>
                        </Card.Header>
                        <Card.Body>
                          <ListGroup variant="flush">
                            <ListGroup.Item className="d-flex justify-content-between">
                              <span className="fw-medium">Check-in:</span>
                              <span>
                                {hotelDetails.policies?.checkin?.begin_time} to{" "}
                                {hotelDetails.policies?.checkin?.end_time}
                              </span>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex justify-content-between">
                              <span className="fw-medium">Check-out:</span>
                              <span>
                                {hotelDetails.policies?.checkout?.time}
                              </span>
                            </ListGroup.Item>
                            <ListGroup.Item>
                              <div className="fw-medium mb-1">
                                Instructions:
                              </div>
                              <div>
                                {hotelDetails.policies?.checkin?.instructions ||
                                  "N/A"}
                              </div>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex justify-content-between">
                              <span className="fw-medium">Minimum Age:</span>
                              <span>
                                {hotelDetails.policies?.checkin?.min_age ||
                                  "N/A"}
                              </span>
                            </ListGroup.Item>
                          </ListGroup>
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col md={6}>
                      <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-info text-white">
                          <h6 className="mb-0">
                            <i className="fas fa-rules me-1"></i> Other Policies
                          </h6>
                        </Card.Header>
                        <Card.Body>
                          <ListGroup variant="flush">
                            <ListGroup.Item className="d-flex justify-content-between">
                              <span className="fw-medium">Pets:</span>
                              <Badge
                                bg={
                                  hotelDetails.policies?.pets
                                    ? "success"
                                    : "secondary"
                                }
                              >
                                {hotelDetails.policies?.pets
                                  ? "Allowed"
                                  : "Not allowed"}
                              </Badge>
                            </ListGroup.Item>
                            <ListGroup.Item className="d-flex justify-content-between">
                              <span className="fw-medium">Fees:</span>
                              <span>
                                {hotelDetails.policies?.fees?.optional || "N/A"}
                              </span>
                            </ListGroup.Item>
                            <ListGroup.Item>
                              <div className="fw-medium mb-1">
                                Know Before You Go:
                              </div>
                              <div>
                                {hotelDetails.policies?.know_before_you_go ||
                                  "N/A"}
                              </div>
                            </ListGroup.Item>
                            <ListGroup.Item>
                              <div className="fw-medium mb-1">Remarks:</div>
                              <div>
                                {hotelDetails.policies?.remark || "N/A"}
                              </div>
                            </ListGroup.Item>
                          </ListGroup>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </div>
              </Tab>
            </Tabs>
          ) : null}
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={() => setShowDetails(false)}>
            <i className="fas fa-times me-1"></i> Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Custom Styles */}
      <style>{`
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f8f9fa;
        }
        
        .card {
          border-radius: 12px;
          transition: transform 0.2s;
        }
        
        .card:hover {
          transform: translateY(-2px);
        }
        
        .btn {
          border-radius: 6px;
          font-weight: 500;
        }
        
        .form-control, .form-select {
          border-radius: 6px;
        }
        
        .table th {
          border-top: none;
          font-weight: 600;
          font-size: 0.9rem;
          text-transform: uppercase;
          color: #6c757d;
        }
        
        .badge {
          font-weight: 500;
        }
        
        .bg-primary {
          background: linear-gradient(45deg, #3498db, #2c3e50) !important;
        }
        
        .bg-success {
          background: linear-gradient(45deg, #2ecc71, #27ae60) !important;
        }
        
        .bg-info {
          background: linear-gradient(45deg, #3498db, #2980b9) !important;
        }
        
        .progress {
          border-radius: 10px;
          height: 10px;
        }
        
        .progress-bar {
          border-radius: 10px;
        }
            .hotel-details-modal .modal-header {
    border-bottom: 2px solid #e9ecef;
  }
  
  .hotel-details-modal .modal-footer {
    border-top: 2px solid #e9ecef;
  }
  
  .hotel-details-modal .nav-tabs .nav-link {
    border: none;
    border-bottom: 3px solid transparent;
    font-weight: 500;
    color: #6c757d;
    padding: 0.8rem 1rem;
  }
  
  .hotel-details-modal .nav-tabs .nav-link.active {
    color: #495057;
    background-color: transparent;
    border-bottom: 3px solid #0d6efd;
  }
  
  .hotel-details-modal .nav-tabs .nav-link:hover {
    border-color: transparent;
    color: #0d6efd;
  }
  
  .amenities-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 0.5rem;
  }
  
  @media (max-width: 768px) {
    .amenities-grid {
      grid-template-columns: 1fr;
    }
  }
      `}</style>
    </div>
  );
}
