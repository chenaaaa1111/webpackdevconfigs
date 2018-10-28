function GetQueryString(name)
{
     var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
     var r = window.location.search.substr(1).match(reg);
     if(r!=null)return  unescape(r[2]); return null;
}
var class_id = GetQueryString('class_id');
var columns = ['A','B','C','D','E','F','G','H','I','G','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
Vue.http.options.emulateJSON = true;
var vm = new Vue({
	el : '#app',
	data : function(){
		return {
            isrelow:false,
			classInfo:{},
			moveing:false,
			moveingItem:{},
			drag_row:'',
			drag_col:'',
			startTime:0,
            canmove:false,
			endTime:0,
            desk_list_pro:[],
			vmax:'A',
            isTouchend:false,
			moveingTarget:null,
			moveOffset:{},
			dragItem:null
		}
	},
	methods : {
		init:function(){
			var _this = this;
			this.$http.get('./json/mock2.json',{params:{class_id:class_id}}).then(function(res){
				var desk_list = [];
				var keys=Object.keys(res.data.studentMap);
				_this.desk_list_pro=res.data.studentMap;
				keys.forEach(function(val,key){
					// var num=parseInt(val);
					var num=val.match(/[A-Z]/g)[0];

					if(_this.vmax<num){
                        _this.vmax=num;
					}
				})
				_this.vmaxNum=columns.indexOf(_this.vmax);
                for(var i in res.data.studentMap){
                    var col = columns.indexOf(i.match(/[A-Z]/g)[0]);

                    var row = i.match(/[0-9]/g)[0]-1;
                    var max =_this.max;

                    if(desk_list[row]){
                        desk_list[row][col] = res.data.studentMap[i]
                    }else{
                        desk_list[row] = [];
                        desk_list[row][col] = res.data.studentMap[i]
                    }
                }
                for(var i in desk_list){
                	if(desk_list[i].length<=_this.vmaxNum){
                        desk_list[i][_this.vmaxNum]={};
					}
				}
				res.data.desk_list = desk_list;
				desk_list.forEach(function (val,key) {
					if(!val[max]){
						val[max]={};
					}
				})
				_this.classInfo = res.data;
				console.log('classinfo',_this.classInfo)
			})

		},
        compareDesk:function (res) {
            var currentObj={};
            this.desk_list.forEach(function(row,row_index){
                row.forEach(function(col,col_index){
                    if(col && col.studentId){
                        var key=columns[col_index]+(row_index+1);
                        col.deskNumber=columns[col_index]+(row_index+1);
                        currentObj[key]=col;
                    }
                })
            })
            this.desk_list_pro=currentObj;
            var commtArray=[];
			for(var ins in currentObj){
				if(res[ins]&&currentObj[ins]){
                    if(currentObj[ins].studentId!=res[ins].studentId){
                        commtArray.push(currentObj[ins]);
                    }
				}else if(currentObj[ins]){
                    if(currentObj[ins]!=res[ins]){
                        commtArray.push(currentObj[ins]);
                    }

				}

			}
            return commtArray;
        },
        complete:function (e) {//提交信息
			this.canmove=false;

            var comarray=this.compareDesk(this.desk_list_pro);
            console.log('要提交的信息',comarray);

        },
		cance:function (e) {
            this.canmove=false;
        },
		isInArea:function(dot,area){
			// 以左上角来判断是否在区域内
			if(dot.left > area.left && dot.top > area.top && dot.left < area.right && dot.top < area.bottom){
				return true
			}
		},
        gotoremain:function (e) {
			console.log('一键提醒');
        },
		// pc端实现拖拽
		drag:function(e,dragItem,drag_row,drag_col){
			this.dragItem = dragItem;
			this.drag_row = drag_row;
			this.drag_col = drag_col;
		},
		allowDrop:function(e){  
            e.preventDefault();  
        },
        bindClick:function (e) {
			console.log('click')
        },
        drop:function(e,dropItem,drop_row,drop_col){
        	var dragStudent = this.dragItem;
			var dropStudent = dropItem;
			this.classInfo.desk_list[drop_row][drop_col] = dragStudent;
			this.classInfo.desk_list[this.drag_row][this.drag_col] = dropStudent;
			this.classInfo = JSON.parse(JSON.stringify(this.classInfo))
        },
        // 移动端实现拖拽
        startMove:function(e,item,drag_row,drag_col){
        	var _this=this;
        	    this.isTouchend=false;
            var startTime=new Date().getTime();
            this.startTime=startTime;

            setTimeout(function (en) {
            	    if(!_this.isTouchend){
                        _this.canmove=true;
                        console.log('长按事件');
					}

            },2000)
        	if(this.canmove){
                    this.moveing = true;
                    this.drag_row = drag_row;
                    this.drag_col = drag_col;
                    this.moveingItem = item;
                    this.moveingTarget = e.target;
                    this.moveOffset = {
                        left : e.target.getBoundingClientRect().left+'px',
                        top : e.target.getBoundingClientRect().top+'px'
                    }
			}
        },
        // 用户滑动
        move:function(e){
        	if(this.canmove){
                if(!this.moveing){
                    return false
                }
                // 更新位置
                this.moveOffset = {
                    left : e.changedTouches[0].clientX+'px',
                    top : e.changedTouches[0].clientY+'px'
                }
			}

        },
        // 用户结束滑动
		endMove:function(e){
			var _this = this;
             this.isTouchend=true;
            if(this.canmove&&_this.moveingTarget){
                    this.$refs.desk.forEach(function(item,index){
                        // 判断是否在某个区域内

                        if(_this.isInArea(_this.moveingTarget.getBoundingClientRect(),item.getBoundingClientRect())){
                            var drop_row = item.getAttribute('data-row');
                            var drop_col = item.getAttribute('data-col');
                            console.log('互换学生')
                            var dragStudent = _this.moveingItem;
                            var dropStudent = _this.classInfo.desk_list[drop_row][drop_col];
                            _this.classInfo.desk_list[drop_row][drop_col] = dragStudent;
                            _this.classInfo.desk_list[_this.drag_row][_this.drag_col] = dropStudent;
                            _this.classInfo = JSON.parse(JSON.stringify(_this.classInfo))
                        }
                    })
                    this.moveing = false;
                    this.moveingItem = {};
                    this.moveingTarget = null

			}else{
			}
		},
		findIndexById:function(studentId){
			for(var i=0;i<this.desk_list.length;i++){
				for(var j=0;j<this.desk_list[i].length;j++){
					if(studentId == this.desk_list[i][j].studentId){
						return [i,j]
					}
				}
			}
		}
	},
    cance:function (e) {
        this.canmove=false;
    },
	watch : {

	},
	computed : {
		moveingStyle:function(){
			return {
				position:'fixed',
				left:this.moveOffset.left,
				top:this.moveOffset.top
			}
		},
		columnWidth:function(){
			var columnWidth = "1.05rem";

			return {
				width : columnWidth
			}
		},
		deskOnwidth:function () {
            var width=0;
            if(this.vmaxNum<8){
            	width="100%";
			}else{
                width=(11+(this.vmaxNum-7)*1.4)+"rem";
			}
            return {
                width : width
            }
        },
		desk_list:function(){
			return this.classInfo.desk_list || []
		},
		allDesk:function(){
			var arr = [];
			if(this.desk_list){
				this.desk_list.forEach(function(row){
					row.forEach(function(item){
						arr.push(item)
					})
				})
			}
			return arr
		},
		//保存的时候提交这个数据就行了
		currentArea:function(){
			var currentArea = [];
			var deskObj={};
			this.desk_list.forEach(function(row,row_index){
				row.forEach(function(col,col_index){
					if(col && col.studentId){
                        deskObj.deskNumber=col;
						currentArea.push({
							studentId:col.studentId,
							deskNumber:columns[col_index]+(row_index+1)
						})
					}
				})
			})
			return currentArea
		},
        sortdesk:function () {
			var sortdesk=[];
			this.desk_list_pro.forEach(function(row,row_index){
                row.forEach(function(col,col_index){
                    if(col && col.studentId){
                        currentArea.push({
                            studentId:col.studentId,
                            deskNumber:columns[col_index]+(row_index+1)
                        })
                    }
                })
            });
			return sortdesk;
        },
		column:function(){
			var maxColumn = 1;
			this.desk_list.forEach(function(row){
				if(row.length > maxColumn){
					maxColumn = row.length
				}
			})
			// if(maxColumn > 8){
			// 	maxColumn = 8
			// }
			return  maxColumn
		}
	},
	created:function(){
		this.init()
	},
	mounted : function(){
		
	}
})



