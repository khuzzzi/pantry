"use client"

import Image from "next/image";
import { useState, useEffect } from "react";
import { firestore } from "@/firebase";
import { Box, Button, Modal, Stack, TextField, Typography } from "@mui/material";
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc } from "firebase/firestore";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");

  const updateInventory = async () => {
    try {
      const snapshot = query(collection(firestore, "inventory"));
      const querySnapshot = await getDocs(snapshot);
      
      const inventoryList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setInventory(inventoryList);
      console.log(inventoryList);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  const addItem = async(item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }
    await updateInventory();
  };

  const removeItem = async(item) => {
    const docRef = doc(collection(firestore, "inventory"), item);
    const docSnap = await getDocs(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();

      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1 });
      }
    }
    await updateInventory();
  };

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleOnClick = () => {
    addItem(itemName);
    setItemName("");
    setOpen(false);
  };

  return (
    <>
      <Box 
        width="100vw" 
        height="100vh" 
        display="flex" 
        flexDirection="column" 
        justifyContent="center" 
        alignItems="center" 
        gap={3}
        sx={{ backgroundColor: '#f5f5f5' }}
      >
        {open === false ? (
          <Button 
            onClick={handleOpen} 
            style={{
              border: "3px solid black", 
              backgroundColor: "red", 
              color: "white", 
              padding: "1.2vh 6vw"
            }}
          >
            Open Inventory
          </Button>
        ) : null}
        
        <Modal 
          open={open} 
          onClose={handleClose} 
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <Box 
            position="absolute" 
            top="50%" 
            left="50%" 
            sx={{
              transform: "translate(-50%, -50%)",
              width: '80vw',
              maxWidth: '400px',
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 24,
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            <Typography id="modal-title" variant="h6" component="h2">
              Add Items
            </Typography>
            <TextField 
              id="modal-description" 
              variant="outlined" 
              fullWidth 
              value={itemName} 
              onChange={(e) => setItemName(e.target.value)} 
              placeholder="Enter item name"
              sx={{ mb: 2 }}
            />
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleOnClick}
              sx={{ alignSelf: 'flex-end' }}
            >
              Add Item
            </Button>
          </Box>
        </Modal>
        <Typography variant="h1" component="h1" sx={{ mb: 3 }}>
          Inventory Management
        </Typography>
        <Stack width="400px" height="300px" spacing={2} overflow="auto">
          {inventory.map((item) => (
            <Box 
              key={item.id} 
              width="100%" 
              minHeight="50px" 
              display="flex" 
              alignItems="center" 
              justifyContent="center" 
              bgcolor="#f0f0f0" 
              padding={2}
              border="1px solid #ccc"
            >
              <Typography variant="h6">
                {`Name: ${item.id}, Quantity: ${item.quantity}`}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    </>
  );
}
