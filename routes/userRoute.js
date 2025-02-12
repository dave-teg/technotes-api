import { Router } from 'express'
import { getAllUsers, createUser, updateUser, deleteUser } from '../controllers/userController.js'
import verifyJWT from '../middleware/verifyJWT.js'

const router = Router()

router.use(verifyJWT)

router.route('/')
      .get(getAllUsers)
      .post(createUser)
      .patch(updateUser)
      .delete(deleteUser)


export default router