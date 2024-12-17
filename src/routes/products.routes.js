import { Router } from "express";
import fs from'fs';



const productsRoutes = Router();

const getProducts = async () => {
    try {
        const product = await fs.promises.readFile('src/db/products.json', 'utf-8');
        
        const productsConverted = JSON.parse(product);
        return productsConverted;
        
    } catch (error) {
        return [];
    }
}


const saveProducts = async (products) => {
    try {
        const parsedProducts = JSON.stringify(products);
        await fs.promises.writeFile('src/db/products.json', parsedProducts, 'utf-8');
        return true;     
    } catch (error) {
        console.log({error});
        return false;       
    }
}

const getSingleProductById = async (pId) => {
    const products = await getProducts();
    const product = products.find(p => p.id === pId);
    return product;
}

productsRoutes.get('/', async (req, res) => {
    const limit = +req.query.limit;
     const products = await getProducts();
    
     if(isNaN(limit) || !limit){
        return res.send({products});
    }
   
    const productsLimited = products.slice(0, limit);
    res.send({products: productsLimited});

});

productsRoutes.get('/:pid', async (req, res) => {
    const pId = +req.params.pid;
    const product = await getSingleProductById(pId);
    if(!product){
        return res.status(404).send({status: 'error', message: 'Product not found'});
    }
    res.send({product})
})


productsRoutes.post('/', async (req, res) => {
    const product = req.body;
    product.id = Math.floor(Math.random() * 10000);

    if(!product.title || !product.description || !product.code || !product.price || !product.status || !product.stock || !product.category){
        return res.status(400).send({status: 'error', message: 'Product incompleted'});
    }
    const products = await getProducts();
    products.push(product);
    const isOK = await saveProducts(products);
    if(!isOK){
        return res.send({status: 'Error', message: 'Prodcut not added'});
    }
    res.send({status: 'ok', message: 'Prodcut added'});
});

productsRoutes.delete('/:pid', async (req, res) => {
    const id = +req.params.pid;
    const product = await getSingleProductById(id);
    if(!product){
        return res.status(404).send({status: 'error', message: 'Product not found'});
    }
    const products = await getProducts();
    const filteredProducts = products.filter(p => p.id !==id);
    const isOK = await saveProducts(filteredProducts);
    if(!isOK){
        return res.status(400).send({status: 'error', message: 'something is wrong'});

    }
    res.send({status: 'ok', message: 'Prodcut deleted'});
    
})

productsRoutes.put('/:pid', async(req, res) => {
    const pId = +req.params.pid;
    const productToUpdate = req.body;
    const products = await getProducts();
    let product = products.find(p => p.id === pId);
    if(!productToUpdate.title || !productToUpdate.description || !productToUpdate.code || !productToUpdate.price || !productToUpdate.status || !productToUpdate.stock || !productToUpdate.category){
        return res.status(400).send({status: 'error', message: 'something is wrong'});

    }
    if(!product){
        return res.status(404).send({status: 'error', message: 'Product not found'});
    }
    const updatedProducts = products.map(p => {
        if(p.id === pId){
            return{
                ...productToUpdate,
                id: pId
            }
        }
        return p;
    })
    const isOK = await saveProducts(updatedProducts);
    if(!isOK){
        return res.status(400).send({status: 'error', message: 'something is wrong'});

    }
    res.send({status: 'ok', message: 'Prodcut updated'});
})




export default productsRoutes;