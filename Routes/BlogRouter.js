const { Router } = require("express");
const isAuth = require("../Middleware/isAuth");
const BlogModel = require("../Model/BlogSchema");
const BlogRouter = Router();

BlogRouter.post("/createblog", isAuth, async (req, res) => {
  try {
    let data = await BlogModel.create(req.body);
    res.send(data);
  } catch (error) {
    res.status(501).send({ msg: error.message });
  }
});

BlogRouter.get("/allBlogs", async (req, res) => {
  try {
    let data = await BlogModel.find().populate("userId", "email username");
    res.status(200).send(data);
  } catch (error) {
    res.status(501).send({ msg: error.message });
  }
});

BlogRouter.get("/myBlogs", isAuth, async (req, res) => {
  try {
    let data = await BlogModel.find({ userId: req.body.userId }).populate(
      "userId",
      "email username"
    );
    res.status(200).send(data);
  } catch (error) {
    res.status(501).send({ msg: error.message });
  }
});

BlogRouter.get("/allBlogs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let data = await BlogModel.findById(id).populate(
      "userId",
      "email username"
    );
    res.status(200).send(data);
  } catch (error) {
    res.status(501).send({ msg: error.message });
  }
});

BlogRouter.delete("/delete",async(req,res)=>{

  try {
      const {id} = req.body;
      console.log(id);
      if(!id)
      {
        return res.status(400).send({msg:"Blog id is required !"})
      }

      const result = await BlogModel.findByIdAndDelete(id);
      console.log(result);
      
      if(!result)
 {
        return res.status(404).send({msg: "Blog not found..!!"})
 }
  return res.send({msg:"Blog delete Successfully!!"})
      } catch (error) {
        console.log("Error deleting blog",error);
        res.status(500).send({msg:"An error occurred while deleting the blog.",error: error.message,})
  }
})

BlogRouter.patch("/edit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let data = await BlogModel.findById(id);
    let a = data.like + 1;
    let d = await BlogModel.findByIdAndUpdate(id, { like: a });
    res.status(200).send({ d });
  } catch (error) {
    res.status(501).send({ msg: error.message });
  }
});



BlogRouter.get("/editget/:id",isAuth,async(req,res)=>{
  try {
      const {id} = req.params;

      const blog = await BlogModel.findById(id);
      console.log(blog);

      if(!blog)
      {
        return res.status(404).send({msg:"Blog not found"})
      }
      res.send({blog})
      
  } catch (error) {
      console.log("Error fetching blogs:",error.message);
      res.status(500).send({msg:"Internal server error"})
      
  }
})

BlogRouter.patch("/editblog", isAuth, async (req, res) => {
  try {
    const { id } = req.body;

    
    const blog = await BlogModel.findByIdAndUpdate(id,req.body);
    console.log(blog)

    if (!blog) {
      return res.status(404).send({ msg: "Blog not found" });
    }

    res.status(200).send({ msg: "Blog updated successfully", blog });
  } catch (error) {
    console.error("Error updating blog:", error);
    res.status(500).send({ msg: "Internal Server Error" });
  }
});


module.exports = BlogRouter;
