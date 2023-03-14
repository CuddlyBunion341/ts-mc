import { BlockModel, ModelElement } from '../blockModels'

export const BlockModelTemplates = {
    cubeAll: new BlockModel([new ModelElement()]),
    slabTop: new BlockModel(
        [new ModelElement().setFrom([0, 8, 0]).setTo([16, 16, 16])],
        [true, false, false, false, false, false]
    ),
    slabBottom: new BlockModel(
        [new ModelElement().setFrom([0, 0, 0]).setTo([16, 8, 16])],
        [false, false, false, false, false, true]
    ),
    slabDouble: new BlockModel([
        new ModelElement().setFace('up', null).setFrom([0, 0, 0]).setTo([16, 8, 16]),
        new ModelElement().setFace('down', null).setFrom([0, 8, 0]).setTo([16, 16, 16]),
    ]),
    pillarY: new BlockModel([
        new ModelElement()
            .setFace('north', 'side')
            .setFace('east', 'side')
            .setFace('south', 'side')
            .setFace('west', 'side')
            .setFace('up', 'end')
            .setFace('down', 'end'),
    ]),
    pillarX: new BlockModel([
        new ModelElement()
            .setFace('north', 'side')
            .setFace('east', 'end')
            .setFace('south', 'side')
            .setFace('west', 'end')
            .setFace('up', 'side')
            .setFace('down', 'side'),
    ]),
    pillarZ: new BlockModel([
        new ModelElement()
            .setFace('north', 'end')
            .setFace('east', 'side')
            .setFace('south', 'end')
            .setFace('west', 'side')
            .setFace('up', 'side')
            .setFace('down', 'side'),
    ]),
}
