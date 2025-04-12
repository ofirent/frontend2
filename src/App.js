import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container, TextField, MenuItem, Button, Typography,
  Card, CardContent, CircularProgress, Box, Collapse,
  List, ListItem, IconButton, CssBaseline, ThemeProvider, createTheme, Snackbar, Alert
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const feedingOptions = ["סימילאק", "הענקה", "שאיבה", "אחר"];

const BabyFeedingTracker = () => {
  const [feedings, setFeedings] = useState([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [foodType, setFoodType] = useState("");
  const [amount, setAmount] = useState("");
  const [expandedDate, setExpandedDate] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false); // מצב חשוך
  const [openSnackbar, setOpenSnackbar] = useState(false); // סטייט להודעה
  const [snackbarMessage, setSnackbarMessage] = useState(""); // הודעת ה-Snackbar

  useEffect(() => {
    fetchFeedings();
  }, []);

  const fetchFeedings = async () => {
    try {
      const res = await axios.get("https://backend-e3b7.onrender.com/api/feedings");
      setFeedings(res.data);
    } catch (err) {
      console.error("שגיאה בטעינת הנתונים", err);
    }
  };

  const handleAddFeeding = async () => {
    if (!date || !time || !foodType || !amount) {
      setSnackbarMessage("חובה להכניס את כל השדות");
      setOpenSnackbar(true);
      return;
    }

    try {
      await axios.post("https://backend-e3b7.onrender.com/api/feedings", {
        date, time, foodType, amount: Number(amount)
      });
      fetchFeedings();
      setDate("");
      setTime("");
      setFoodType("");
      setAmount("");
    } catch (err) {
      console.error("שגיאה בהוספת נתון", err);
    }
  };

  const handleDeleteFeeding = async (id) => {
    try {
      await axios.delete(`https://backend-e3b7.onrender.com/api/feedings/${id}`);
      fetchFeedings();
    } catch (err) {
      console.error("שגיאה במחיקה", err);
    }
  };

  const calculateDailyStats = () => {
    const groupedByDate = {};
    feedings.forEach(({ id, date, time, food_type, amount }) => {
      if (!groupedByDate[date]) groupedByDate[date] = { total: 0, count: 0, foodCount: {}, entries: [] };
      groupedByDate[date].total += amount;
      groupedByDate[date].count += 1;
      groupedByDate[date].foodCount[food_type] = (groupedByDate[date].foodCount[food_type] || 0) + amount;
      groupedByDate[date].entries.push({ id, time, foodType: food_type, amount });
    });

    return Object.keys(groupedByDate).map((date) => {
      const { total, count, foodCount, entries } = groupedByDate[date];
      const avgAmount = (total / count).toFixed(1);
      const mostEaten = Object.keys(foodCount).reduce((a, b) => (foodCount[a] > foodCount[b] ? a : b));
      const avgTimeGap = count > 1 ? (24 / count).toFixed(1) : "N/A";
      const percentage = Math.min((total / 100) * 100, 100);
      return { date, avgAmount, mostEaten, avgTimeGap, percentage, entries };
    });
  };

  const theme = createTheme({
    palette: {
      mode: isDarkMode ? "dark" : "light",
    },
  });
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("he-IL"); 
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="sm" sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="h4" gutterBottom>מעקב האכלת תינוק</Typography>
        <Button 
          variant="outlined" 
          color={isDarkMode ? "secondary" : "primary"} 
          onClick={() => setIsDarkMode(!isDarkMode)} 
          sx={{ mb: 2 }}
        >
          {isDarkMode ? "מצב אור" : "מצב חשוך"}
        </Button>
        <TextField fullWidth  type="date" value={date} onChange={(e) => setDate(e.target.value)} sx={{ mb: 2 }} />
        <TextField fullWidth type="time" value={time} onChange={(e) => setTime(e.target.value)} sx={{ mb: 2 }} />
        <TextField fullWidth select label="מה אכל" value={foodType} onChange={(e) => setFoodType(e.target.value)} sx={{ mb: 2 }}>
          {feedingOptions.map((option) => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </TextField>
        <TextField fullWidth label="כמה CC" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} sx={{ mb: 2 }} />
        <Button variant="contained" color="primary" fullWidth onClick={handleAddFeeding}>הוסף</Button>

        {calculateDailyStats().map(({ date, avgAmount, mostEaten, avgTimeGap, entries }) => (
          <Card key={date} sx={{ mt: 3, textAlign: "center", p: 2 }}>
            <CardContent>
              <Typography variant="h6"> תאריך : {formatDate(date)} </Typography>
              <Typography>ממוצע אכילה: {avgAmount} CC</Typography>
              <Typography sx={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => setExpandedDate(expandedDate === date ? null : date)}>
                האוכל שנאכל הכי הרבה: {mostEaten}
              </Typography>
              <Collapse in={expandedDate === date}>
                <List>
                  {entries.map(({ id, time, foodType, amount }) => (
                    <ListItem key={id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      {time} - {foodType} ({amount} CC)
                      <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteFeeding(id)}>
                        <DeleteIcon color="error" />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
              <Typography>זמן ממוצע בין ארוחות: {avgTimeGap} שעות</Typography>
            </CardContent>
          </Card>
        ))}

        {/* Snackbar for missing fields */}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={() => setOpenSnackbar(false)}
        >
          <Alert onClose={() => setOpenSnackbar(false)} severity="error" sx={{ width: "100%" }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
};

export default BabyFeedingTracker;
