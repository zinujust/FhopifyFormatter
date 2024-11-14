import mongoose, { Types } from 'mongoose';

const icapsSchema = new mongoose.Schema({
    itemNumber: {type: String, required: true},
    listPrice: {type: Number, required: true},
    costColumn1Price: {type: Number, required: true},
    mapPrice: {type: Number, required: true},
    description: {type: String, required: true},
    brandLongName: {type: String, required: true},
    manufacturerLongName: {type: String, required: true},
    uom: {type: String, required: true},
    itemWeight: {type: Number, required: true},
    keywords: {type: String, required: true},
    sellingCopyShort: {type: String, required: true},
    sellingPoint1: {type: String, required: true},
    sellingPoint2: {type: String, required: true},
    sellingPoint3: {type: String, required: true},
    sellingPoint4: {type: String, required: true},
    sellingPoint5: {type: String, required: true},
    upcRetail: {type: String, required: true},
    itemDepth: {type: Number, required: true},
    itemHeight: {type: Number, required: true},
    itemWidth: {type: Number, required: true},
    itemGtin: {type: String, required: true},
})

export default mongoose.model('IcapsMaster', icapsSchema);