import { Router } from 'express';
import fs from 'fs';

const cartsRoutes = Router();


const cartsFilePath = 'src/db/carrito.json';


const getCarts = async () => {
    try {
        const cartsData = await fs.promises.readFile(cartsFilePath, 'utf-8');
        return JSON.parse(cartsData);
    } catch (error) {
        
        return [];
    }
};


const saveCarts = async (carts) => {
    try {
        await fs.promises.writeFile(cartsFilePath, JSON.stringify(carts, null, 2), 'utf-8');
        return true;
    } catch (error) {
        console.error('Error al guardar el archivo de carritos:', error);
        return false;
    }
};


const getCartById = async (cId) => {
    const carts = await getCarts();
    return carts.find(cart => cart.id === cId);
};


cartsRoutes.post('/', async (req, res) => {
    const carts = await getCarts();

    
    const newCart = {
        id: carts.length > 0 ? carts[carts.length - 1].id + 1 : 1,
        products: []
    };

    carts.push(newCart);
    const isSaved = await saveCarts(carts);

    if (!isSaved) {
        return res.status(500).send({ status: 'error', message: 'Error al crear el carrito' });
    }

    res.status(201).send({ status: 'success', message: 'Carrito creado', cart: newCart });
});


cartsRoutes.get('/:cid', async (req, res) => {
    const cId = +req.params.cid;
    const cart = await getCartById(cId);

    if (!cart) {
        return res.status(404).send({ status: 'error', message: 'Carrito no encontrado' });
    }

    
    res.send({ products: cart.products });
});


cartsRoutes.post('/:cid/product/:pid', async (req, res) => {
    const cId = +req.params.cid;
    const pId = +req.params.pid;

    const carts = await getCarts();
    const cartIndex = carts.findIndex(cart => cart.id === cId);

    if (cartIndex === -1) {
        return res.status(404).send({ status: 'error', message: 'Carrito no encontrado' });
    }

    
    const productIndex = carts[cartIndex].products.findIndex(p => p.product === pId);

    if (productIndex !== -1) {
        
        carts[cartIndex].products[productIndex].quantity += 1;
    } else {
        
        carts[cartIndex].products.push({ product: pId, quantity: 1 });
    }

    const isSaved = await saveCarts(carts);

    if (!isSaved) {
        return res.status(500).send({ status: 'error', message: 'Error al agregar el producto' });
    }

    res.send({ status: 'success', message: `Producto ${pId} agregado al carrito ${cId}` });
});

export default cartsRoutes;
