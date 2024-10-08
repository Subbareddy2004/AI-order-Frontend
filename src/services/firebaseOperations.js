import { db, collection, getDocs, doc, getDoc } from './firebase';
import { getDistance } from 'geolib';

export const fetchMenuItems = async () => {
	try {
		const foodItemsSnapshot = await getDocs(collection(db, 'fs_food_items1'));
		return foodItemsSnapshot.docs.map(doc => ({
			id: doc.id,
			...doc.data(),
			productRating: doc.data().productRating || 0 // Provide a default value if missing
		}));
	} catch (error) {
		console.error('Error fetching menu items:', error);
		throw error;
	}
};

// const menuItems = menuItemsSnapshot.docs
//     .filter(doc => doc.data().productOwnership === hotelData.hotelName)
//     .map(doc => ({
//         id: doc.id,
//         ...doc.data(),
//         productRating: doc.data().productRating || 0
//     }));

export const fetchPopularItems = async () => {
    try {
        const foodItemsSnapshot = await getDocs(collection(db, 'fs_food_items1'));
        const allItems = foodItemsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            productRating: doc.data().productRating || 0
        }));
        
        // Sort by rating and return top 5
        return allItems.sort((a, b) => b.productRating - a.productRating).slice(0, 5);
    } catch (error) {
        console.error('Error fetching popular items:', error);
        throw error;
    }
};

export const fetchHotelDetails = async (hotelId) => {
    try {
        const hotelDoc = await getDoc(doc(db, 'fs_hotels', hotelId));
        if (hotelDoc.exists()) {
            const hotelData = hotelDoc.data();
            console.log('Hotel data:', hotelData); // Debug log
            const menuItemsSnapshot = await getDocs(collection(db, 'fs_food_items1'));
            const menuItems = menuItemsSnapshot.docs
                .filter(doc => doc.data().productOwnership === hotelData.hotelUsername) // Changed from hotelName to hotelUsername
                .map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    productRating: doc.data().productRating || 0
                }));
            console.log('Filtered menu items:', menuItems); // Debug log
            return {
                id: hotelDoc.id,
                ...hotelData,
                menuItems
            };
        } else {
            throw new Error('Hotel not found');
        }
    } catch (error) {
        console.error('Error fetching hotel details:', error);
        throw error;
    }
};

export const fetchHotels = async () => {
	try {
		const hotelsSnapshot = await getDocs(collection(db, 'fs_hotels'));
		return hotelsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
	} catch (error) {
		console.error('Error fetching hotels:', error);
		throw error;
	}
};

export const fetchMenuCategories = async () => {
    try {
        const foodItemsSnapshot = await getDocs(collection(db, 'fs_food_items1'));
        const foodItems = foodItemsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Group items by category
        const categoriesMap = foodItems.reduce((acc, item) => {
            if (!acc[item.productMainCategory]) {
                acc[item.productMainCategory] = {
                    name: item.productMainCategory,
                    items: [],
                    imageUrl: item.productImg // Use the first item's image as category image
                };
            }
            acc[item.productMainCategory].items.push(item);
            return acc;
        }, {});

        // Convert map to array
        const categories = Object.values(categoriesMap);

        return categories;
    } catch (error) {
        console.error('Error fetching menu categories:', error);
        throw error;
    }
};

export const fetchLastOrder = async (userId) => {
    try {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('userId', '==', userId), orderBy('orderDate', 'desc'), limit(1));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            const lastOrder = querySnapshot.docs[0].data();
            return { itemId: lastOrder.itemId, orderDate: lastOrder.orderDate };
        }
        return null;
    } catch (error) {
        console.error('Error fetching last order:', error);
        return null;
    }
};

export const fetchItemsByCategory = async (categoryName) => {
    try {
        const foodItemsSnapshot = await getDocs(collection(db, 'fs_food_items1'));
        const categoryItems = foodItemsSnapshot.docs
            .filter(doc => doc.data().productMainCategory.toLowerCase() === categoryName.toLowerCase())
            .map(doc => ({
                id: doc.id,
                ...doc.data(),
                productRating: doc.data().productRating || 0
            }));
        return categoryItems;
    } catch (error) {
        console.error('Error fetching items by category:', error);
        throw error;
    }
};

export const fetchPopularItemsWithHotelInfo = async (userLocation) => {
    try {
        const foodItemsSnapshot = await getDocs(collection(db, 'fs_food_items1'));
        const hotelsSnapshot = await getDocs(collection(db, 'fs_hotels'));

        const hotels = hotelsSnapshot.docs.reduce((acc, doc) => {
            const hotelData = doc.data();
            if (hotelData.latitude && hotelData.longitude) {
                acc[doc.id] = hotelData;
            } else {
                console.warn(`Hotel ${doc.id} is missing latitude or longitude`);
            }
            return acc;
        }, {});

        const allItems = foodItemsSnapshot.docs.map(doc => {
            const itemData = doc.data();
            const hotel = hotels[itemData.productOwnership];
            let hotelDistance = null;
            if (hotel && userLocation && userLocation.latitude && userLocation.longitude) {
                hotelDistance = calculateDistance(
                    userLocation,
                    { latitude: hotel.latitude, longitude: hotel.longitude }
                );
            }
            return {
                id: doc.id,
                ...itemData,
                productRating: itemData.productRating || 0,
                hotelName: hotel ? hotel.hotelName : 'Unknown Hotel',
                hotelDistance: hotelDistance
            };
        });
        
        // Sort by rating and return top 6
        return allItems.sort((a, b) => b.productRating - a.productRating).slice(0, 6);
    } catch (error) {
        console.error('Error fetching popular items with hotel info:', error);
        throw error;
    }
};

const calculateDistance = (userLocation, hotelLocation) => {
    if (!userLocation || !hotelLocation) return null;
    if (!userLocation.latitude || !userLocation.longitude || !hotelLocation.latitude || !hotelLocation.longitude) {
        console.warn('Invalid coordinates for distance calculation');
        return null;
    }
    return getDistance(
        { latitude: userLocation.latitude, longitude: userLocation.longitude },
        { latitude: hotelLocation.latitude, longitude: hotelLocation.longitude }
    ) / 1000; // Convert meters to kilometers
};


export const fetchHotelsWithMenuItems = async (userLat, userLon) => {
	try {
		const hotelsSnapshot = await getDocs(collection(db, 'fs_hotels'));
		const menuItemsSnapshot = await getDocs(collection(db, 'fs_food_items1'));

		const hotels = hotelsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
		const menuItems = menuItemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

		const hotelsWithItems = hotels.map(hotel => {
			const hotelItems = menuItems.filter(item => item.productOwnership === hotel.hotelUsername);
			let distance = null;
			if (userLat && userLon) {
				distance = getDistance(
					{ latitude: userLat, longitude: userLon },
					{ latitude: parseFloat(hotel.latitude), longitude: parseFloat(hotel.longitude) }
				) / 1000; // Convert meters to kilometers
			}
			return {
				...hotel,
				distance,
				menuItems: hotelItems
			};
		});

		// Sort hotels by distance if user location is available
		if (userLat && userLon) {
			hotelsWithItems.sort((a, b) => a.distance - b.distance);
		}

		return hotelsWithItems;
	} catch (error) {
		console.error('Error fetching hotels with menu items:', error);
		throw error;
	}
};

export const fetchAllItems = async () => {
	try {
		const itemsCollection = collection(db, 'fs_food_items1');
		const itemsSnapshot = await getDocs(itemsCollection);
		return itemsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
	} catch (error) {
		console.error('Error fetching all items:', error);
		throw error;
	}
};

export const fetchAllMedicalItems = async () => {
	try {
		const categoriesSnapshot = await getDocs(collection(db, 'medical_eqipment_categories1'));
		const categories = await Promise.all(categoriesSnapshot.docs.map(async (categoryDoc) => {
			const categoryData = categoryDoc.data();
			const dataCollectionRef = collection(categoryDoc.ref, 'data');
			const providersSnapshot = await getDocs(dataCollectionRef);
			const providers = providersSnapshot.docs.map(doc => ({
				id: doc.id,
				...doc.data(),
				Categories: categoryDoc.id
			}));
			return {
				id: categoryDoc.id,
				...categoryData,
				type: 'category',
				providers: providers
			};
		}));

		return categories;
	} catch (error) {
		console.error('Error fetching items:', error);
		throw error;
	}
};

export const fetchMedicareData = async (userLat, userLon) => {
	try {
		const categoriesSnapshot = await getDocs(collection(db, 'medical_eqipment_categories1'));
		const categories = await Promise.all(categoriesSnapshot.docs.map(async (categoryDoc) => {
			const categoryData = categoryDoc.data();
			const dataCollectionRef = collection(categoryDoc.ref, 'data');
			const itemsSnapshot = await getDocs(dataCollectionRef);
			const items = {};
			itemsSnapshot.docs.forEach(doc => {
				items[doc.data().Name] = doc.data().image_url;
			});
			const providers = await Promise.all(itemsSnapshot.docs.map(async (doc) => {
				const providerData = doc.data();
				let distance = 'N/A';
				if (userLat && userLon && providerData.Pincode) {
					const providerCoords = await getPincodeCoordinates(providerData.Pincode);
					if (providerCoords) {
						distance = getDistance(
							{ latitude: userLat, longitude: userLon },
							providerCoords
						) / 1000; // Convert meters to kilometers
					}
				}
				return {
					id: doc.id,
					...providerData,
					distance: distance
				};
			}));
			return {
				id: categoryDoc.id,
				name: categoryData.name,
				items: items,
				providers: providers
			};
		}));

		return categories;
	} catch (error) {
		console.error('Error fetching Medicare data:', error);
		throw error;
	}
};